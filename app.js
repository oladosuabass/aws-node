const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios')
const path = require('path');
const multer = require('multer');
const sizeOf = require('image-size');
const resizeImg = require('resize-image-buffer');
const cors = require('cors');
const dotenv = require('dotenv')
const aws = require('aws-sdk');


const generateUploadURL = require('./s3.js');
const generateUploadURL2 = require('./s3_resize.js');

const headers = {
  "Content-Type": "multipart/form-data"
}

dotenv.config()

const app = express();

app.set('view engine', 'ejs')
app.set('views')

const region = "us-east-1"
const bucketName = "aws-test-photos-resize"
const accessKeyId = process.env.ACCESS_KEY_ID
const secretAccessKey = process.env.SECRET_ACCESS_KEY


app.use(bodyParser.urlencoded({extended: false}));
app.use(multer().single('image'))
app.use(cors())
  
app.get('/upload-image', (req, res, next) => {

    res.sendFile(path.join(__dirname, './', 'views', 'upload-image.html'));
  });

app.get('/', async (req, res) => {
    aws.config.setPromisesDependency()
    aws.config.update({
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
      region: region
    })

    const s3 = new aws.S3();
    const response = await s3.listObjectsV2({
      Bucket: bucketName
    }).promise();
    const box = []
    const b = response['Contents']
    b.forEach(pushImage);

    function pushImage(value) {
      box.push("https://aws-test-photos-resize.s3.amazonaws.com" + '/' + value['Key'])
    }
    res.render('index', {data: box})
});


app.post('/s3Url', async (req, res) => {
  const file = req.file.buffer
  await generateUploadURL().then(url=>{
    axios.put(url, file, 
      { 
      headers: headers
      }
      )
  })
  await generateUploadURL2().then(url=>{
    const imageUrl = url.split('?')[0]
    // store image with half width
    const dimensions = sizeOf(file);
      resizeImg(file, {
        width: dimensions.width/2,
        height: dimensions.height/2,
      }).then(data=>{

        axios.put(url, data, 
          { 
            headers: headers
          }
          ).then(()=>{
            res.status(302).redirect('/')
          })
      })
  })
}
)
const port = process.env.port || 5000

app.listen(port);
