package handler

import (
	"go-docs/cmd/utils"
	"log"
	"net/http"
	"os"

	"github.com/coder/websocket"
)

type SocketHandler struct {
}

func NewSocketHandler() *SocketHandler {
	return &SocketHandler{}
}

func (h *SocketHandler) ServeTestWS(w http.ResponseWriter, r *http.Request) {
	c, err := websocket.Accept(w, r, &websocket.AcceptOptions{
		OriginPatterns: []string{os.Getenv("CLIENT_URL")},
	})
	if err != nil {
		utils.GetErrorResponse("Internal Server Error", err.Error(), w, http.StatusInternalServerError)
		return
	}
	defer c.Close(websocket.StatusNormalClosure, "")

	for {
		_, msg, err := c.Read(r.Context())
		if err != nil {
			utils.GetErrorResponse("Internal Server Error", err.Error(), w, http.StatusInternalServerError)
			return
		}

		log.Println("Received message: ", string(msg))
		c.Write(r.Context(), websocket.MessageText, []byte("Hello, world!"))
	}

}
