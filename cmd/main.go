package main

import (
	"context"
	"tradingviewcharts-go/charts"
	"log"

	binance "github.com/adshao/go-binance/v2"
)

func main() {

	cs := charts.NewChartServer()

	candles, err := getDailyCandlestickDataFromBinance()
	if err != nil {
		log.Fatal(err.Error())
	}

	cs.SetCandlestickData(candles)

	if err := cs.Start(); err != nil {
		log.Fatal(err.Error())
	}

}

func getDailyCandlestickDataFromBinance() ([]*charts.Candle, error) {
	client := binance.NewClient("", "")

	klines, err := client.NewKlinesService().
		Symbol("BTCUSDT").
		Interval("1d").
		Do(context.Background())
	if err != nil {
		return nil, err
	}
	var candles []*charts.Candle
	for _, k := range klines {
		candles = append(candles, &charts.Candle{
			Timestamp: k.OpenTime / 1000,
			Open:      k.Open,
			High:      k.High,
			Low:       k.Low,
			Close:     k.Close,
			Volume:    k.Volume,
		})
	}

	return candles, nil
}
