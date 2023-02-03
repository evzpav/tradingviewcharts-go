package charts

import (
	"embed"
	"encoding/json"
	"fmt"
	"io/fs"
	"net/http"
)

//go:embed trading-view-react/build
var embeddedFiles embed.FS

const defaultPort string = "9901"

type Candle struct {
	Time   int64  `json:"time"`
	Open   string `json:"open"`
	High   string `json:"high"`
	Low    string `json:"low"`
	Close  string `json:"close"`
	Volume string `json:"volume"`
}

type chartServer struct {
	port    string
	candles []*Candle
}

func NewChartServer() *chartServer {
	return &chartServer{
		port: defaultPort,
	}
}

func (cs *chartServer) SetCandlestickData(candles []*Candle) {
	cs.candles = candles
}

func (cs *chartServer) Start() error {
	fmt.Println("Starting chart server on http://localhost:" + cs.port)
	http.Handle("/", http.FileServer(getFileSystem()))
	http.HandleFunc("/data", cs.handleData)

	return http.ListenAndServe(":"+cs.port, nil)
}

func getFileSystem() http.FileSystem {

	// Get the build subdirectory as the
	// root directory so that it can be passed
	// to the http.FileServer
	fsys, err := fs.Sub(embeddedFiles, "trading-view-react/build")
	if err != nil {
		panic(err)
	}

	return http.FS(fsys)
}

func (cs *chartServer) handleData(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-type", "text/json")

	err := json.NewEncoder(w).Encode(map[string]interface{}{
		"candles": cs.candles,
	})
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(err.Error()))
	}
}
