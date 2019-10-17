import * as AWS from "aws-sdk";

const OS_ENDPOINT = process.env.OS_ENDPOINT || "";
const OS_KEY = process.env.OS_KEY || "";
const OS_SECRET = process.env.OS_SECRET || "";
const OS_REGION = process.env.OS_REGION || "";

interface FilesResponse {
  message: string;
  data: any[];
}

const client = new AWS.S3({
  endpoint: OS_ENDPOINT,
  accessKeyId: OS_KEY,
  secretAccessKey: OS_SECRET,
  region: OS_REGION
});

export const createFile = (bucketName: string, fileName: string, file: any) : Promise<any> => {
    return new Promise((resolve, reject) => {
        let params = {
            Bucket: bucketName,
            Key: fileName,
            Body: file
          };
        client.upload(params, {partSize: 5*1024*1024, queueSize: 10}, (err, data) => {
            if (!err) {
                resolve({
                    fileUrl : data.Location
                });
            } else {
                reject({
                    error: err
                });
            }
        });
    });
}

export const getFiles = (bucketName: string): Promise<FilesResponse> => {
  return new Promise((resolve, reject) => {
    client.listObjectsV2({ Bucket: bucketName }, (err, data) => {
      if (err) {
        reject({
          message: "Error when execute call",
          error: err.message
        });
      } else if (!data.Contents) {
        reject({
          message: "No data found"
        });
      } else {
        let objects: any[] = [];
        data.Contents.forEach(element => {
          objects.push({
            fileName: element.Key,
            lastModified: element.LastModified
          });
        });
        resolve({
          message: `Files from ${bucketName}`,
          data: objects
        });
      }
    });
  });
}
