const constants = require("../common/constants.js");
const utils = require("../common/utils.js");

const MLP = require("../common/classifiers/mlp.js");

const fs = require("fs");

console.log("RUNNING CLASSIFICATION ...");

const {samples: trainingSamples} = JSON.parse(
    fs.readFileSync(constants.TRAINING)
);

const mlp = new MLP([
    5, // 5 features
    8 // 8 outputs (no hidden layer for now)
], utils.classes);

const {samples: testingSamples} = JSON.parse(
    fs.readFileSync(constants.TESTING)
);

let totalCount = 0;
let correctCount = 0;
for (const sample of testingSamples) {
    const {label: predictedLabel} = mlp.predict(sample.point);
    correctCount += predictedLabel === sample.label;
    totalCount++;
}

console.log(
    "ACCURACY: " +
    correctCount +
    "/" +
    totalCount +
    " (" +
    utils.formatPercent(correctCount / totalCount) +
    ")"
);

console.log("GENERATING DECISION BOUNDARY ...");

const {createCanvas} = require("canvas");
const imgSize = 100;
const canvas = createCanvas(imgSize, imgSize);
const ctx = canvas.getContext("2d");

for (let x = 0; x < canvas.width; x++) {
    for (let y = 0; y < canvas.height; y++) {
        const point = [x / canvas.width, 1 - y / canvas.height];
        while (point.length < trainingSamples[0].point.length) {
            point.push(0);
        }
        const {label} = mlp.predict(point);
        const color = utils.styles[label].color;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
    }
    utils.printProgress(x + 1, canvas.width);
}

const buffer = canvas.toBuffer("image/png");
fs.writeFileSync(constants.DECISION_BOUNDARY, buffer);
