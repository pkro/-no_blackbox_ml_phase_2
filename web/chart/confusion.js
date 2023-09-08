class Confusion {
    constructor(container, samples, classes, options) {
        this.samples = samples;
        this.container = container;
        this.classes = classes;
        this.options = options;

        this.size = options.size;
        this.styles = options.styles;

        this.N = classes.length + 1; // +1 because of the left / top bar
        this.cellSize = this.size / (this.N + 1); // why another +1?

        this.table = document.createElement("table");
        this.table.style.borderCollapse = "collapse";
        this.table.style.textAlign = "center";
        this.table.style.marginLeft = this.cellSize + "px";
        this.table.style.marginTop = this.cellSize + "px";

        container.appendChild(this.table);

        const topText = document.createElement('div');
        topText.innerHTML = "Predicted class";
        topText.style.position = "absolute";
        topText.style.fontSize = "x-large";
        topText.style.top = "0px";
        // magic centering
        topText.style.left = "50%";
        topText.style.transform = "translate(-50%)";
        topText.style.height = this.cellSize + "px";
        topText.style.display = "flex";
        topText.style.alignItems = "center";
        topText.style.marginLeft = (this.cellSize / 2) + "px";
        container.appendChild(topText);

        const leftText = document.createElement('div');
        leftText.innerHTML = "True class";
        leftText.style.position = "absolute";
        leftText.style.fontSize = "x-large";
        leftText.style.top = "50%";
        // magic centering
        leftText.style.left = "0px";
        leftText.style.transform = "translate(-50%) rotate(-90deg)";
        leftText.style.height = this.cellSize + "px";
        leftText.style.display = "flex";
        leftText.style.alignItems = "center";
        leftText.style.marginLeft = (this.cellSize / 2) + "px";

        container.appendChild(leftText);


        this.matrix = this.#prepareMatrix(samples);
        this.#fillTable();


    }

    #prepareMatrix(samples) {
        const matrix = [];
        for (let i = 0; i < this.N; i++) {
            matrix[i] = [];
            for (let j = 0; j < this.N; j++) {
                matrix[i][j] = 0;
            }
        }

        // count predictions for each combination (?)
        for (const s of samples) {
            matrix[this.classes.indexOf(s.truth) + 1]
                [this.classes.indexOf(s.label) + 1]++;
        }

        // calculate totals for rows and column headers
        // column headers = predicted class, row titles = actual (true) class
        // in a perfect prediction, the totals for the rows and for
        // the columns would be the same
        for (let i = 1; i < this.N; i++) {
            for (let j = 1; j < this.N; j++) {
                matrix[0][j] += matrix[i][j];
                matrix[i][0] += matrix[i][j];
            }
        }

        for (let i = 1; i < this.N; i++) {
            //let percent = (matrix[0][i] / (matrix[i][0]/100)).toFixed(2);
            let difference = matrix[0][i] - matrix[i][0];
            matrix[0][i] = difference > 0 ? '+' + difference : difference;
        }
        matrix[0][0] = '';

        return matrix;

    }

    #fillTable() {
        const {N, matrix, styles, classes, cellSize, table} = this;

        const values = matrix
            .slice(1) // skip first row
            .map(t => t.slice(1)) // skip first column
            .flat();

        const max = Math.max(...values);
        const min = Math.min(...values);

        for (let i = 0; i < N; i++) {
            const row = document.createElement('tr');
            table.appendChild(row);
            for (let j = 0; j < N; j++) {
                const cell = document.createElement("td");
                cell.style.width = cellSize + "px";
                cell.style.height = cellSize + "px";
                cell.style.padding = "0";

                cell.textContent = matrix[i][j];

                if (i === 0 && j > 0) {
                    cell.style.backgroundImage = "url(" + styles[classes[j - 1]].image.src + ")";
                    cell.style.backgroundRepeat = "no-repeat";
                    cell.style.backgroundPosition = "50% 20%";
                    cell.style.verticalAlign = "bottom"
                    cell.style.fontWeight = "bold";

                    // give the numbers varying intensities of red (positive) and blue (negative)
                    const proportion = 2 * // double the proportion
                        matrix[i][j] / matrix[j][i];
                    const RED = proportion >= 0 ? proportion * 255 : 0;
                    const BLUE = proportion <= 0 ? -proportion * 255 : 0;
                    cell.style.color = `rgb(${RED},0,${BLUE})`;
                }

                if (j === 0 && i > 0) {
                    cell.style.backgroundImage = "url(" + styles[classes[i - 1]].image.src + ")";
                    cell.style.backgroundRepeat = "no-repeat";
                    cell.style.backgroundPosition = "0 50%";
                    cell.style.width = "80px";
                    cell.style.textAlign = "right";
                    cell.style.fontWeight = "bold";
                }

                if (i > 0 && j > 0) {
                    const p = math.invLerp(min, max, matrix[i][j]);
                    if (i === j) {
                        cell.style.backgroundColor = `rgba(0,0,255,${p})`;
                    } else {
                        cell.style.backgroundColor = `rgba(255,0,0,${p})`;

                    }
                }




                row.appendChild(cell);
            }
        }
    }
}