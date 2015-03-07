var Object360 = function (obj) {
    this.canvas = obj.canvas;
    this.ctx = obj.canvas.getContext('2d');
    this.frameRate = obj.frameRate;
    this.init(obj.imagesPackage);
    this.afterLoadingCallback = obj.afterLoadingCallback;
    this.drawFrame = 0;
    this.zoomLevel = 0.5;
};

Object360.prototype = {
    init: function (package) {
        var that = this;
        this.imagesHash = {};
        new ResourcePacker(package, function (elements) {
            for (var t in elements) {
                if (t === "image") {
                    var images = elements.image;
                    for (var i in images) {
                        var img = document.createElement("img");
                        img.onload = function () {
                            window.URL.revokeObjectURL(images[i].blobURL);
                        };
                        img.src = images[i].blobURL;
                        that.imagesHash[images[i].filename] = img;
                    }
                }
            }
            that.afterImageLoaded();
        });
    },
    afterImageLoaded: function () {
        this.createImagesArray();
        this.totalFrames = this.images.length;
        if (this.afterLoadingCallback) {
            this.afterLoadingCallback();
        }

        var that = this;
        window.requestAnimationFrame(function () {
            that.render();
        });
    },
    createImagesArray: function () {
        var sortedKeys = Object.keys(this.imagesHash).sort();
        this.images = [];
        for (var i = 0, cnt = sortedKeys.length; i < cnt; i++) {
            this.images.push(this.imagesHash[sortedKeys[i]]);
        }
    },
    render: function () {
        if (this.drawFrame !== this.frame) {
            var image = this.images[this.drawFrame];
            var sw, sh, sx, sy, dx, dy, dw, dh;
            if (image.width*this.zoomLevel < this.canvasWidth) {
                sw = image.width * this.zoomLevel;
                sh = sw * (image.height / image.width);
                sx = Math.max((image.width - sw) / 2, 0);
                sy = Math.max((image.height - sh) / 2, 0);
                dx = 0;
                dy = 0;
                dw = this.canvas.width;
                dh = dw * (image.height / image.width);
            } else {
                sw = image.width;
                sh = sw * (image.height / image.width);
                sx = 0;
                sy = 0;
                dw = sw/this.zoomLevel;
                dh = sh/this.zoomLevel;
                dx = (this.canvas.width-dw)/2;
                dy = (this.canvas.height-dh)/2;
            }
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(this.images[this.drawFrame], sx, sy, sw, sh, dx, dy, dw, dh);
            //this.ctx.drawImage(image, 0, 0);
            this.frame = this.drawFrame;
        }
        var that = this;
        window.requestAnimationFrame(function () {
            that.render();
        });
    },
    showFrame: function (frameIndex) {

        if (frameIndex < 0) {
            frameIndex = this.totalFrames - Math.abs(frameIndex) % this.totalFrames;
        }

        if (frameIndex >= this.totalFrames) {
            frameIndex = frameIndex % this.totalFrames;
        }

        this.drawFrame = frameIndex;
    },
    setZoomLevel: function (percent) {
        this.zoomLevel = Math.round(percent*10)/10;
    }
};