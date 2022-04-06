
// import dotenv from 'dotenv'
const aws = require('aws-sdk');
// import crypto from 'crypto';
// import {promisify} from "util";
// const randomBytes = promisify(crypto.randomBytes)

// dotenv.config()

function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * 
charactersLength));
 }
 return result;
}

const region = "us-east-1"
const bucketName = "aws-test-photos-resize"
const accessKeyId = "AKIAYLRBZFMR3YKYTAEO"
const secretAccessKey = "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"

const s3 = new aws.S3({
  region,
  accessKeyId,
  secretAccessKey,
  signatureVersion: 'v4'
})

module.exports = async function generateUploadURL2() {
  // const rawBytes = await randomBytes(16)
  
  const imageName = `${makeid(8)}.jpg`
  // const imageName = rawBytes.toString('hex')

  const params = ({
    Bucket: bucketName,
    Key: imageName,
    Expires: 60
  })
  
  const uploadURLResize = await s3.getSignedUrlPromise('putObject', params)
  return uploadURLResize
}