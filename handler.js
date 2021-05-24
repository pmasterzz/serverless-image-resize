'use strict';

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const Jimp = require('jimp');
const s3 = new AWS.S3();
const width = 200;
const height = 200;
const imageType = 'image/png';
const bucket = process.env.BUCKET;

module.exports.upload = (event, context, callback) => {
    console.log('the Bucket', bucket);
    console.log(process.env);
  let requestBody = JSON.parse(event.body);
  let photoUrl = requestBody.photoUrl;
  let objectId = uuidv4();
  let objectKey = `resize-${width}xheight${height}-${objectId}.png`;

  fetchImage(photoUrl)
  .then(image => image.resize(width, height).getBufferAsync(imageType))
  .then(resizedBuffer => uploadToS3(resizedBuffer, objectKey))
  .then(function(response) {
    console.log(`Image ${objectKey} was uploaded and resized!`);
    callback(
      null, {
        statusCode: 200,
        body: JSON.stringify(response)
      }
    )
  })
  .catch(error => console.log(error));
};

function uploadToS3(data, key) {
  return s3
  .putObject({
    Bucket: bucket,
    Key: key,
    Body: data,
    ContentType: imageType
  }).promise();
}

function fetchImage(url) {
  return Jimp.read(url);
}