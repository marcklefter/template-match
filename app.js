const loadImage = (imageUrl, canvasElement) => {
    return new Promise((resolve) => {
        let canvas  = document.getElementById(canvasElement);
        let context = canvas.getContext('2d');
    
        let image       = new Image();
        image.onload    = () => {
            canvas.width    = image.width;
            canvas.height   = image.height;

            context.drawImage(image, 0, 0, image.width, image.height);
            resolve(image);
        };
        image.src       = imageUrl;
    });
};

// ...

// matches a template against an original image using a sum of absolute differences (SAD) measure.
const matchTemplate = (S_w, S_h, S, T_w, T_h, T) => {
    let minSAD = Number.MAX_SAFE_INTEGER;
    
    let posX;
    let posY;

    for (let y = 0; y <= S_h - T_h; y++)
    {
        for (let x = 0; x <= S_w - T_w; x++)
        {
            let SAD = 0;

            // loop through template image data.
            for (let j = 0; j < T_h; j++)
            { 
                let S_idx = (y + j) * S_w;
                let T_idx = j * T_w;

                for (let i = 0; i < T_w; i++)
                {
                    let S_idx_i = (S_idx + (x + i)) * 4;
                    let T_idx_i = (T_idx + i) * 4;

                    let S_pixel = S[S_idx_i];   // using R(ed) component.
                    let T_pixel = T[T_idx_i];   // using R(ed) component.

                    SAD += Math.abs(S_pixel - T_pixel);
                }
            }

            if (minSAD > SAD)
            {
                minSAD = SAD;

                posX = x;
                posY = y;
            }
        }
    }

    console.log(posX);
    console.log(posY);

    return { x: posX, y: posY };
};

$(() => {
    Promise.all([loadImage('original.jpg', 'original'), loadImage('template.jpg', 'template')])
        .then(() => {
            
            let originalCanvas  = document.getElementById('original');
            let originalContext = originalCanvas.getContext('2d');
            let originalData    = originalContext.getImageData(0, 0, originalCanvas.width, originalCanvas.height).data
            
            let templateCanvas  = document.getElementById('template');
            let templateContext = templateCanvas.getContext('2d');
            let templateData    = templateContext.getImageData(0, 0, templateCanvas.width, templateCanvas.height).data

            $('#status').html('Working...');

            setTimeout(
                () => {

                    let pos = matchTemplate(
                        originalCanvas.width, originalCanvas.height, originalData, 
                        templateCanvas.width, templateCanvas.height, templateData
                    );

                    $('#status').html(`Matched x: ${pos.x}, y: ${pos.y}`);

                    originalContext.beginPath();
                    originalContext.rect(pos.x, pos.y, templateCanvas.width, templateCanvas.height);
                    originalContext.strokeStyle = 'red';
                    originalContext.stroke();
                },
                0
            );
        });
});