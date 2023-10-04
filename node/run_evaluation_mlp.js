const constants = require("../common/constants.js");
const utils = require("../common/utils.js");

const MLP = require("../common/classifiers/mlp.js");

const fs = require("fs");

console.log("RUNNING CLASSIFICATION ...");

const {samples: trainingSamples} = JSON.parse(
    fs.readFileSync(constants.TRAINING)
);

const mlp = new MLP([
    trainingSamples[0].point.length, // input layers depending on number of features
        10, // 10 hidden layers
        utils.classes.length // output layers -> the image classes (clock, house etc.
    ],
    utils.classes);

// if we have a last saved model load it so we never get a lower fit than the
// one we got during the last run (still by chance, so the new model isn't really
// learning anything from the last, it just uses the data as the current best fitting model
if (fs.existsSync(constants.MODEL)) {
    mlp.load(JSON.parse(fs.readFileSync(constants.MODEL)));
}

mlp.fit(trainingSamples);

// save best model
fs.writeFileSync(constants.MODEL, JSON.stringify(mlp));
fs.writeFileSync(constants.MODEL_JS, `const model = ${JSON.stringify(mlp)};`);



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
const imgSize = 1000;
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
