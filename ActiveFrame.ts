export interface ActiveFrameManifestFrame {
  i: number;
  t: number;
  o: number;
  l: number;
  ty: 'key' | 'delta';
  data?: Uint8Array;
}

export interface ActiveFrameManifest {
  codec: string;
  width: number;
  height: number;
  totalFrames: number;
  description: string;
  frames: ActiveFrameManifestFrame[];
}

export interface ActiveFrameOptions {
  process?: (frame: VideoFrame) => Promise<void> | void;
  hardwareAcceleration?: HardwareAcceleration;
}

const cacheActiveFrameList = new Map<string, Promise<{ manifest: ActiveFrameManifest; data: ArrayBuffer }>>();

export class ActiveFrame {
  file: string;
  manifest: ActiveFrameManifest | null = null;
  data: ArrayBuffer | null = null;
  decoder: VideoDecoder | null = null;
  frame: number | null = null;
  desideredFrame = 0;
  enabled = true;
  framesByTimestamp = new Map<number, number>();
  frameProcessed: number | null = null;
  loading: Promise<void>;
  process: ((frame: VideoFrame) => Promise<void> | void) | null = null;
  hardwareAcceleration: HardwareAcceleration;
  config: VideoDecoderConfig | null = null;
  private _pendingFrame: number | null = null;

  constructor(file: string, options: ActiveFrameOptions = {}) {
    this.file = file;
    this.process = options.process || null;
    this.hardwareAcceleration = options.hardwareAcceleration || 'prefer-hardware';
    this.loading = this.init();
  }

  async init(): Promise<void> {
    if (typeof window === 'undefined' || !('VideoDecoder' in window)) {
      return;
    }

    if (!cacheActiveFrameList.has(this.file)) {
      cacheActiveFrameList.set(this.file, this.loadBinary(this.file));
    }

    const { manifest, data } = await cacheActiveFrameList.get(this.file)!;
    this.manifest = manifest;
    this.data = data;

    this.manifest.frames.forEach((frame) => {
      frame.data = new Uint8Array(this.data!, frame.o, frame.l);
      this.framesByTimestamp.set(frame.t, frame.i);
    });

    await this.initDecoder();
  }

  async loadBinary(file: string): Promise<{ manifest: ActiveFrameManifest; data: ArrayBuffer }> {
    const res = await fetch(file);
    const fullBuffer = await res.arrayBuffer();

    const footer = new DataView(fullBuffer, fullBuffer.byteLength - 4);
    const manifestOffset = footer.getUint32(0, true);

    const manifestBytes = new Uint8Array(fullBuffer, manifestOffset, fullBuffer.byteLength - 4 - manifestOffset);
    const manifest = JSON.parse(new TextDecoder().decode(manifestBytes)) as ActiveFrameManifest;

    return { manifest, data: fullBuffer };
  }

  decodeDescription(description: string): Uint8Array {
    const binaryString = atob(description);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  async initDecoder(): Promise<void> {
    if (!this.manifest) return;

    const baseConfig: VideoDecoderConfig = {
      codec: this.manifest.codec,
      codedWidth: this.manifest.width,
      codedHeight: this.manifest.height,
      colorSpace: {
        primaries: 'bt709',
        transfer: 'bt709',
        matrix: 'bt709',
        fullRange: false,
      },
      description: this.decodeDescription(this.manifest.description),
    };

    const candidates: VideoDecoderConfig[] = [
      { ...baseConfig, hardwareAcceleration: this.hardwareAcceleration, optimizeForLatency: true },
      { ...baseConfig, hardwareAcceleration: this.hardwareAcceleration },
      { ...baseConfig, optimizeForLatency: true },
      { ...baseConfig },
    ];

    for (const candidate of candidates) {
      const support = await VideoDecoder.isConfigSupported(candidate);
      if (support.supported) {
        this.config = candidate;
        break;
      }
    }

    if (!this.config) {
      throw new Error('VideoDecoder configuration not supported');
    }

    this.decoder = new VideoDecoder({
      output: (frame) => this.outputFrame(frame),
      error: (e) => {
        console.error('ActiveFrame Decoder error:', e);
      },
    });

    this.decoder.configure(this.config);
  }

  async outputFrame(frame: VideoFrame): Promise<void> {
    if (!this.enabled) {
      frame.close();
      return;
    }

    const timestampToFrameId = this.framesByTimestamp.get(frame.timestamp);

    if (this.desideredFrame !== timestampToFrameId) {
      frame.close();
      return;
    }

    this.frame = timestampToFrameId;

    if (this.process) {
      await this.process(frame);
    }

    this.frameProcessed = timestampToFrameId;
    frame.close();
  }

  setFrame(desideredFrame: number): void {
    if (!this.manifest || !this.enabled || !this.decoder || !this.config) return;

    desideredFrame = Math.round(Number(desideredFrame));
    const maxFrame = Math.max(0, this.manifest.totalFrames - 1);
    desideredFrame = Math.min(Math.max(desideredFrame, 0), maxFrame);
    this.desideredFrame = desideredFrame;

    if (this.desideredFrame === this.frame) return;
    if (this.desideredFrame === this._pendingFrame) return;

    this._pendingFrame = desideredFrame;

    const frameMeta = this.manifest.frames[this.desideredFrame];
    if (!frameMeta || !frameMeta.data) return;

    const isSequential =
      this.frame !== null && this.desideredFrame === this.frame + 1 && frameMeta.ty === 'delta';

    if (isSequential) {
      this.decoder.decode(
        new EncodedVideoChunk({
          type: frameMeta.ty,
          timestamp: frameMeta.t,
          data: frameMeta.data,
        })
      );
      return;
    }

    if (this.decoder.decodeQueueSize > 0 || this.decoder.state !== 'configured') {
      this.decoder.reset();
      this.decoder.configure(this.config);
    }

    if (frameMeta.ty === 'key') {
      this.decoder.decode(
        new EncodedVideoChunk({
          type: frameMeta.ty,
          timestamp: frameMeta.t,
          data: frameMeta.data,
        })
      );
    } else {
      let keyFrame: ActiveFrameManifestFrame | null = null;
      for (let i = this.desideredFrame; i >= 0; i--) {
        const f = this.manifest.frames[i];
        if (f.ty === 'key') {
          keyFrame = f;
          break;
        }
      }

      if (!keyFrame || !keyFrame.data) {
        console.error('No key frame found in ActiveFrame');
        return;
      }

      this.decoder.decode(
        new EncodedVideoChunk({
          type: keyFrame.ty,
          timestamp: keyFrame.t,
          data: keyFrame.data,
        })
      );

      for (let i = keyFrame.i + 1; i <= this.desideredFrame; i++) {
        const f = this.manifest.frames[i];
        if (f.ty === 'delta' && f.data) {
          this.decoder.decode(
            new EncodedVideoChunk({
              type: f.ty,
              timestamp: f.t,
              data: f.data,
            })
          );
        } else {
          break;
        }
      }
    }
  }

  destroy(): void {
    cacheActiveFrameList.delete(this.file);
    this.enabled = false;
    if (this.decoder && this.decoder.state !== 'closed') {
      this.decoder.close();
    }
    this.decoder = null;
    this.data = null;
    this.manifest = null;
    this.process = null;
    this.framesByTimestamp.clear();
  }
}
