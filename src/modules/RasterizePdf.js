class RasterizePdf {
  constructor() {
    this.__PDF_DOC
    this.__CURRENT_PAGE
    this.__TOTAL_PAGES
    this.__PAGE_RENDERING_IN_PROGRESS = 0
    this.cnv
    this.__CANVAS
    this.__CANVAS_CTX
    this.pdfLoader
    this.pdfPrevButton
    this.pdfNextButton
    this.pageLoader
    this.uploadButton
    this.showPageNumbers
    this.tempFile
    this.resolution = 1
    this.images = []
    this.vanillaImageBlobs = []
  }

  gotFile = (pdfData) => {
    this.images = []
    this.tempFile = pdfData
    this.showPDF(URL.createObjectURL(pdfData.file))
  }

  showPDF = (pdf_url) => {
    this.pdfLoader.show()

    pdfjsLib.getDocument({
      url: pdf_url
    }).promise.then((pdf_doc) => {
      this.__PDF_DOC = pdf_doc
      this.__TOTAL_PAGES = this.__PDF_DOC.numPages

      this.pdfLoader.hide()

      this.renderPdfToCanvas(1)
    }).catch((error) => {

      this.pdfLoader.hide()
      alert(error.message)
    })
  }

  renderImageToCanvas = (page_no) => {
    resizeCanvas(this.images[this.__CURRENT_PAGE - 1].width, this.images[this.__CURRENT_PAGE - 1].height)
    image(this.images[this.__CURRENT_PAGE - 1], 0, 0)
    this.showPageNumbers.html(`${page_no}/${this.__TOTAL_PAGES}`)
  }

  loadPdfRasterizer = () => {

    this.cnv = createCanvas(500, 500).position(10, 100)
    this.__CANVAS = this.cnv.canvas
    this.__CANVAS_CTX = this.__CANVAS.getContext('2d')

    this.cnv.drop(this.gotFile)

    this.resolutionDropDown = createSelect()
      .position(10, 40)
      .changed(() => {
        this.resolution = this.resolutionDropDown.value().split(':')[0]
        if (this.tempFile) {
          this.gotFile(this.tempFile)
        }
      })
    this.resolutionDropDown.option('0.5:1')
    this.resolutionDropDown.option('1:1')
    this.resolutionDropDown.option('2:1')
    this.resolutionDropDown.option('3:1')
    this.resolutionDropDown.option('4:1')
    this.resolutionDropDown.value('1:1')

    this.resolutionLabel = createDiv("resolution")
      .position(91, 40)
      .style('font-family', 'arial')

    this.uploadButton = createFileInput(this.gotFile)
      .position(10, 70)
      .style('font-family', 'arial')

    this.pdfLoader = createDiv('Load PDF')
      .position(10, 10)
      .style('font-family', 'arial')

    this.pageLoader = createDiv('Rasterizing PDF...')
      .position(20, 110)
      .hide()
      .style('font-family', 'arial')

    this.showPageNumbers = createDiv(``)
      .position(91, 10)
      .style('font-family', 'arial')

    this.pdfPrevButton = createButton('Previous')
      .position(10, 10)
      .hide()
      .mouseClicked(() => {
        if (this.__CURRENT_PAGE != 1)
          this.renderImageToCanvas(--this.__CURRENT_PAGE)
      })

    this.pdfNextButton = createButton('Next')
      .position(150, 10)
      .hide()
      .mouseClicked(() => {
        if (this.__CURRENT_PAGE != this.__TOTAL_PAGES)
          this.renderImageToCanvas(++this.__CURRENT_PAGE)
      })

    background(50)
    fill(255)
    textSize(32);
    text('drag and drop pdf of score', 10, 40)
  }

  renderPdfToCanvas = (page_no) => {
    this.__PAGE_RENDERING_IN_PROGRESS = 1
    this.__CURRENT_PAGE = page_no

    this.pageLoader.show()

    this.showPageNumbers.html(`${page_no}/${this.__TOTAL_PAGES}`)

    this.__PDF_DOC.getPage(page_no).then((page) => {

      let pdfResolution = page.getViewport({
        scale: 1
      })

      let pdfTransform = pdfResolution.transform
      let pdfResolutionWidth = pdfResolution.width
      let pdfResolutionHeight = pdfResolution.height
      let pdfAspectRatio = pdfResolutionWidth / pdfResolutionHeight

      resizeCanvas(pdfResolution.width * this.resolution, pdfResolution.height * this.resolution)

      let viewport = page.getViewport({
        scale: this.resolution
      })

      let renderContext = {
        canvasContext: this.__CANVAS_CTX,
        viewport: viewport
      }

      page.render(renderContext).promise.then(() => {
        this.__PAGE_RENDERING_IN_PROGRESS = 0
        this.pageLoader.hide()

        let img = new p5.Image()
        let vanillaImage = new Image()
        vanillaImage.src = this.__CANVAS.toDataURL()
        img.src = this.__CANVAS.toDataURL()

        if (!this.images[this.__CURRENT_PAGE - 1]) {
          this.vanillaImageBlobs[this.__CURRENT_PAGE - 1] = vanillaImage.src
          this.images[this.__CURRENT_PAGE - 1] = loadImage(img.src, () => {
            if (this.__CURRENT_PAGE < this.__TOTAL_PAGES) {
              this.renderPdfToCanvas(++this.__CURRENT_PAGE)
            } else {
              this.__CURRENT_PAGE = 1
              this.pdfPrevButton.show()
              this.pdfNextButton.show()
              this.renderImageToCanvas(1)

              userMediaData = {
                ...userMediaData,
                images: this.images,
                vanillaImageBlobs: this.vanillaImageBlobs
              }
              downloadFileButton.show()
            }
          })
        }
      })
    })
  }
}
