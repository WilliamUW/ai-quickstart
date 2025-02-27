require("dotenv").config({ path: ".env" });

const { FlatDirectory } = require("ethstorage-sdk");

const privateKey = process.env.ETHSTORAGE_PRIVATE_KEY;
const ethStorageRpc = "https://rpc.beta.testnet.l2.ethstorage.io:9596";
const rpc = "https://rpc.beta.testnet.l2.quarkchain.io:8545";

async function test() {
  const address = "0xA460C70b474cA4125c35dFaFfC1e83B0122efcaB"; // FlatDirectory address

  const flatDirectory = await FlatDirectory.create({
    rpc: rpc,
    ethStorageRpc: ethStorageRpc,
    privateKey: privateKey,
    address: address,
  });

  if (false) {
    // await flatDirectory.deploy();
    console.log("flat directory successful", flatDirectory);
    const request = {
      key: "test.txt",
      content: Buffer.from("big data"),
      type: 2, // 1 for calldata and 2 for blob
      callback: {
        onProgress(progress, count, isChange) {},
        onFail(err) {},
        onFinish(totalUploadChunks, totalUploadSize, totalStorageCost) {},
      },
    };
    const response = await flatDirectory.upload(request);
    console.log("uploaded", response);
  }

  const key = "text-generation-2025-02-27T04:24:41.943Z.json";
  await flatDirectory.download(key, {
    onProgress: function (progress, count, chunk) {
      console.log(
        `Download ${progress} of ${count} chunks, this chunk is ${chunk.toString()}`
      );
    },
    onFail: function (error) {
      console.error("Error download data:", error);
    },
    onFinish: function () {
      console.log("Download success.");
    },
  });
}
test();
