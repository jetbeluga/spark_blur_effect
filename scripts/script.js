/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 */

import { textureSampler, vertexAttribute } from "Shaders";

//==============================================================================
// Welcome to scripting in Spark AR Studio! Helpful links:
//
// Scripting Basics - https://fb.me/spark-scripting-basics
// Reactive Programming - https://fb.me/spark-reactive-programming
// Scripting Object Reference - https://fb.me/spark-scripting-reference
// Changelogs - https://fb.me/spark-changelog
//
// Spark AR Studio extension for VS Code - https://fb.me/spark-vscode-plugin
//
// For projects created with v87 onwards, JavaScript is always executed in strict mode.
//==============================================================================

// How to load in modules
const Scene = require("Scene");

// Use export keyword to make a symbol available in scripting debug console
export const Diagnostics = require("Diagnostics");
const T = require("Textures");
const S = require("Shaders");
const R = require("Reactive");
const Time = require("Time");
const M = require("Materials");
const D = require("Diagnostics");
// To use variables and functions across files, use export/import keyword
// export const animationDuration = 10;

// Use import keyword to import a symbol from another file
// import { animationDuration } from './script.js'

(async function () {
  // Enables async/await in JS [part 1]
  const [cameraTex, defaultMat, canvas] = await Promise.all([
    T.findFirst("cameraTexture0"),
    M.findFirst("material0"),
    Scene.root.findFirst("canvas0"),
    // await Scene.create("Canvas", {
    //   name: "Canvas",
    //   hidden: false,
    // }),
  ]);

  function boxBlur(tex, uv, steps, strength) {
    const iterStep = Math.floor(steps / 2.0);
    const pixelWH = R.pack2(
      R.mul(strength, R.div(1.0, canvas.width)),
      R.mul(strength, R.div(1.0, canvas.height))
    );
    let blendColor = R.pack4(0, 0, 0, 0);
    for (let i = -iterStep; i <= iterStep; i++) {
      for (let j = -iterStep; j <= iterStep; j++) {
        const blurUV = R.add(uv, R.mul(R.pack2(i, j), pixelWH));
        blendColor = R.add(blendColor, S.textureSampler(tex, blurUV));
      }
    }
    const numSamples = 1.0 / (steps * steps);
    return R.mul(blendColor, R.pack4(numSamples, numSamples, numSamples, 1));
  }
  D.watch("test", canvas.width);

  //  const [material, texture] = await Promise.all([
  //   Materials.findFirst('defaultMaterial0'),
  //   Textures.findFirst('texture0')
  // ]);

  const uv = S.vertexAttribute({ variableName: S.VertexAttribute.TEX_COORDS });
  const fuv = S.fragmentStage(uv);
  const curve = R.mul(R.sin(R.mul(Time.ms, 0.001)), 4);

  const color = boxBlur(cameraTex.signal, fuv, 9, curve);
  const textureSlot = S.DefaultMaterialTextures.DIFFUSE;
  R.pack2;
  defaultMat.setTextureSlot(textureSlot, color);
  // To access scene objects
  // const [directionalLight] = await Promise.all([
  //   Scene.root.findFirst('directionalLight0')
  // ]);

  // To access class properties
  // const directionalLightIntensity = directionalLight.intensity;

  // To log messages to the console
  // Diagnostics.log('Console message logged from the script.');
})(); // Enables async/await in JS [part 2]
