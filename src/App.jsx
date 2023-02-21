import { useCallback, useEffect, useRef, useState } from "react";
import { createWorker } from "tesseract.js";
import "./index.css";
import { preprocessImage } from "./preprocessImage";

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const canvasBWRef = useRef(null);
  const snapshotCanvasRef = useRef(null);
  const snapshotCanvas2Ref = useRef(null);

  const [text, setText] = useState("");
  const [text2, setText2] = useState("");

  const handleClick = async () => {
    const context = snapshotCanvasRef.current?.getContext("2d");
    context.drawImage(
      videoRef.current,
      100,
      300,
      600,
      200,
      0,
      0,
      snapshotCanvasRef.current.width,
      snapshotCanvasRef.current.height
    );

    const context2 = snapshotCanvas2Ref.current?.getContext("2d");
    context2.drawImage(
      videoRef.current,
      100,
      300,
      600,
      200,
      0,
      0,
      snapshotCanvas2Ref.current.width,
      snapshotCanvas2Ref.current.height
    );

    context2.putImageData(preprocessImage(canvasBWRef.current), 0, 0);

    const url = snapshotCanvasRef.current?.toDataURL("image/png");
    const url2 = snapshotCanvas2Ref.current?.toDataURL("image/png");

    const ass = async () => {
      const wew = await createWorker();
      return wew;
    };
    const worker = await ass();

    await worker.load();
    await worker.loadLanguage("ind");
    await worker.initialize("ind");
    const ocr = await worker.recognize(url);
    const ocr2 = await worker.recognize(url2);
    setText(ocr.data.text || "Gak Kebaca wkwk");
    setText2(ocr2.data.text || "Gak Kebaca wkwk");
  };

  useEffect(() => {
    requestAnimationFrame(draw);
    const ctx = canvasRef.current?.getContext("2d");

    function draw() {
      canvasRef.current.width = 300;
      canvasRef.current.height = 100;
      ctx.drawImage(videoRef.current, 100, 300, 600, 200, 0, 0, 300, 100);
      const imgData = ctx.getImageData(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      const data = imgData.data;
      ctx.putImageData(imgData, 0, 0);
      requestAnimationFrame(draw);
    }
  }, []);

  useEffect(() => {
    requestAnimationFrame(draw);
    const ctx = canvasBWRef.current?.getContext("2d");

    function draw() {
      canvasBWRef.current.width = 300;
      canvasBWRef.current.height = 100;
      ctx.drawImage(videoRef.current, 100, 300, 600, 200, 0, 0, 300, 100);
      const imgData = ctx.getImageData(
        0,
        0,
        canvasBWRef.current.width,
        canvasBWRef.current.height
      );
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const ave = (data[i + 0] + data[i + 1] + data[i + 2]) / 3;
        data[i + 0] = data[i + 1] = data[i + 2] = ave > 128 ? 255 : 0;
        data[i + 3] = 255;
      }
      ctx.putImageData(imgData, 0, 0);
      requestAnimationFrame(draw);
    }
  }, []);

  useEffect(() => {
    const constraints = {
      audio: false,
      video: {
        width: 1920,
        height: 1080,
        facingMode: "environment",
      },
    };
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      let video = videoRef.current;
      if (video) {
        video.srcObject = stream;
      }
    });
  }, []);

  return (
    <div className="flex-center">
      <h1>OCR Tampan</h1>
      <video
        className="player"
        ref={videoRef}
        controls
        autoPlay
        playsInline
      ></video>
      <canvas
        className="video-scanning"
        ref={canvasRef}
        width="300"
        height="100"
      ></canvas>
      <canvas
        className="video-scanning"
        ref={canvasBWRef}
        width="300"
        height="100"
      ></canvas>
      <div className="action">
        <button className="capture" onClick={handleClick}>
          Capture
        </button>
      </div>
      <div style={{ backgroundColor: "aquamarine", textAlign: "center" }}>
        <canvas ref={snapshotCanvasRef} width="300" height="100"></canvas>
        <h4>Result: Original Image:</h4>
        <h2>{text}</h2>
      </div>
      <br />
      <div style={{ backgroundColor: "lightgreen", textAlign: "center" }}>
        <canvas ref={snapshotCanvas2Ref} width="300" height="100"></canvas>
        <h4>Result: Preprocess Image:</h4>
        <h2>{text2}</h2>
      </div>
    </div>
  );
}

export default App;
