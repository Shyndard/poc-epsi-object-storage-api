import { getFiles, createFile } from "./objectStorage";
import fastify from "fastify";

const OS_BUCKET_NAME = process.env.OS_BUCKET_NAME || "";
const API_PORT = process.env.API_PORT || "";

const server = fastify({});
server.register(require("fastify-multipart"));

server.get("/documents", (request, reply) => {
  getFiles(OS_BUCKET_NAME)
    .then(result => {
      reply.send(result.data);
    })
    .catch(err => {
      reply.status(500).send(err);
    });
});

server.post("/document", function(req: any, reply) {
  const mp = req.multipart(handler, function(err: any) {
    if (err) reply.status(500).send(err);
  });
  function handler(
    field: any,
    file: any,
    fileName: string,
    encoding: any,
    mimetype: any
  ) {
    createFile(OS_BUCKET_NAME, fileName, file)
      .then(result => {
        reply.status(200).send(result);
      })
      .catch(err => {
        reply.status(500).send(err);
      });
  }
});

server.listen(8080, (err, address) => {
  if (err) throw err;
  server.log.info(`server listening on ${address}`);
});
