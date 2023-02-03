package main

import (
	"context"
	"fmt"
	"log"
	"strconv"
	"tradingviewcharts-go/charts"

	binance "github.com/adshao/go-binance/v2"
)

func main() {

	cs := charts.NewChartServer()

	respData, err := getDailyCandlestickDataFromBinance("BTCUSDT", "1h")
	if err != nil {
		log.Fatal(err.Error())
	}

	cs.SetResponseData(respData)

	if err := cs.Start(); err != nil {
		log.Fatal(err.Error())
	}

}

func getDailyCandlestickDataFromBinance(symbol, interval string) (*charts.ResponseData, error) {
	client := binance.NewClient("", "")

	klines, err := client.NewKlinesService().
		Symbol(symbol).
		Interval(interval).
		Do(context.Background())
	if err != nil {
		return nil, err
	}
	var candles []*charts.Candle

	for _, k := range klines {

		candles = append(candles, &charts.Candle{
			Time:   k.OpenTime / 1000,
			Open:   round(k.Open),
			High:   round(k.High),
			Low:    round(k.Low),
			Close:  round(k.Close),
			Volume: round(k.Volume),
		})
	}

	return &charts.ResponseData{
		Symbol:   symbol,
		Interval: interval,
		Candles:  candles,
	}, nil
}

func round(v string) string {
	f, err := strconv.ParseFloat(v, 64)
	if err != nil {
		return "0"
	}

	return fmt.Sprintf("%.2f", f)

}
