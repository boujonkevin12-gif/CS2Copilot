declare module "snappyjs" {
  function uncompress(compressed: Uint8Array | ArrayBuffer | Buffer): Uint8Array | ArrayBuffer | Buffer;
  function compress(uncompressed: Uint8Array | ArrayBuffer | Buffer): Uint8Array | ArrayBuffer | Buffer;
}
