let userMediaData = {}
const rasterizePdf = new RasterizePdf()

function setup() {
  // pixelDensity(1)
  rasterizePdf.loadPdfRasterizer()

  var zip = new JSZip();

  downloadFileButton = createButton('download')
    .position(220, 10)
    .hide()
    .mousePressed(() => {
      for (let i = 0; i < userMediaData.vanillaImageBlobs.length; i++) {
        zip.file(`images/img_${i}.png`, dataURLtoBlob(userMediaData.vanillaImageBlobs[i]))
      }
      zip.generateAsync({
          type: "blob"
        })
        .then(function(blob) {
          saveAs(blob, "images.zip");
        });
    })
}


function dataURLtoBlob(dataurl) {
  var arr = dataurl.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], {
    type: mime
  });
}
