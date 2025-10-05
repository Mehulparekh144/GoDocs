BINARY_PATH = ./bin/app

build:
	go build -o $(BINARY_PATH) ./cmd

run:
	./$(BINARY_PATH)

br: 
	make build && make run
	
clean:
	rm -f $(BINARY_PATH)