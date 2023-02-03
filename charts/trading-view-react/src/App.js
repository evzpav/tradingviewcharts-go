import { useEffect, useRef, useState } from 'react';
import './App.css';
import { createChart, CrosshairMode } from 'lightweight-charts';
import { getData } from './services/data';

function App() {
  const greenColor = '#26a69a';
  const redColor = '#ef5350';
  // upColor: '#4bffb5',
  // downColor: '#ff4976',

  const [candles, setCandles] = useState([]);
  const [legend, setLegend] = useState("");
  const [symbol, setSymbol] = useState("");
  const [interval, setInterval] = useState("");

  const chartContainerRef = useRef();
  const chart = useRef();

  const handleResize = () => {
    if (chart.current) {
      chart.current.applyOptions({ width: chartContainerRef.current.clientWidth });
    }
  };

  useEffect(() => {
    let mounted = true;
    getData().then(res => {
      if (mounted) {
        setCandles(res.data.candles);
        setSymbol(res.data.symbol);
        setInterval(res.data.interval);
      }
    }).catch(err => {
      console.log(err)
    })
    return () => mounted = false;
  }, [])


  useEffect(() => {
    if (!candles || !candles.length) {
      return
    }

    chart.current = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 500,
      layout: {
        backgroundColor: '#253248',
        textColor: 'rgba(255, 255, 255, 0.9)',
      },
      grid: {
        vertLines: {
          color: '#334158',
        },
        horzLines: {
          color: '#334158',
        },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      priceScale: {
        borderColor: '#485c7b',
      },
      timeScale: {
        timeVisible: true,
        borderColor: '#485c7b',
      },
    });

    const candleSeries = chart.current.addCandlestickSeries({
      upColor: greenColor,
      downColor: redColor,
      borderDownColor: redColor,
      borderUpColor: greenColor,
      wickDownColor: '#838ca1',
      wickUpColor: '#838ca1',
    });

    candleSeries.setData(candles);


    chart.current.timeScale().fitContent();

    const volumeSeries = chart.current.addHistogramSeries({
      lineWidth: 2,
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: "",
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    const volumeData = candles.map((c) => {
      const color = c.open < c.close ? greenColor : redColor;
      return { "value": c.volume, "time": c.time, color }
    })
    volumeSeries.setData(volumeData);

    chart.current.subscribeCrosshairMove(param => {
      if (param.time) {
        const candleData = param.seriesPrices.get(candleSeries);
        const volume = param.seriesPrices.get(volumeSeries);
        candleData["volume"] = volume;
        setLegend(candleData);
      }
    });

  }, [candles]);

  // Resize chart on container resizes.
  useEffect(() => {
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);

      if (chart && chart.current) {
        chart.current.remove();
      }
    };
  }, []);

  return (
    <div className="app">
      <div ref={chartContainerRef} className="chart-container">
        <div className="legend">
          <div className="symbol-interval">{symbol}&ensp;{interval}</div>
          <div>
            O:<span className={setLegendNumberClass(legend)}>{legend.open}</span>&ensp;
            H:<span className={setLegendNumberClass(legend)}>{legend.high}</span>&ensp;
            L:<span className={setLegendNumberClass(legend)}>{legend.low}</span>&ensp;
            C:<span className={setLegendNumberClass(legend)}>{legend.close}</span>&ensp;
            V:<span className={setLegendNumberClass(legend)}>{legend.volume}</span>
          </div>
        </div>
      </div>
    </div >
  );
}


function setLegendNumberClass(legend) {
  return legend.open < legend.close ? "green-number" : "red-number"
}


export default App;
