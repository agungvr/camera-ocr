import { useCallback, useEffect, useRef, useState } from "react";
import { createWorker } from "tesseract.js";
import "./index.css";

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const canvasBWRef = useRef(null);
  const snapshotCanvasRef = useRef(null);

  const [text, setText] = useState("");

  const handleClick = async () => {
    var context = snapshotCanvasRef.current?.getContext("2d");
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
    const url = snapshotCanvasRef.current?.toDataURL("image/png");

    const ass = async () => {
      const wew = await createWorker();
      return wew;
    };
    const worker = await ass();
    console.log(worker);
    await worker.load();
    await worker.loadLanguage("eng");
    await worker.initialize("eng");
    const { data } = await worker.recognize(url);
    setText(data.text || "Gak Kebaca wkwk");
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
    var constraints = {
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
      <canvas ref={snapshotCanvasRef} width="300" height="100"></canvas>
      <h2>{text}</h2>
    </div>
  );
}

export default App;
