package server

import (
	"embed"
	"net/http"
	"path/filepath"

	"github.com/go-chi/chi/v5"
)

//go:embed static
var staticFiles embed.FS

func handleChatPage(w http.ResponseWriter, r *http.Request) {
	data, err := staticFiles.ReadFile("static/chat.html")
	if err != nil {
		http.Error(w, "page not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Write(data)
}

func handleFontFile(w http.ResponseWriter, r *http.Request) {
	file := chi.URLParam(r, "file")
	data, err := staticFiles.ReadFile("static/fonts/" + file)
	if err != nil {
		http.Error(w, "font not found", http.StatusNotFound)
		return
	}
	switch filepath.Ext(file) {
	case ".ttf":
		w.Header().Set("Content-Type", "font/ttf")
	case ".woff2":
		w.Header().Set("Content-Type", "font/woff2")
	}
	w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
	w.Write(data)
}
