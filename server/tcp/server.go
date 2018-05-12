package main

import (
	"net"
	"log"
	"bufio"
	"fmt"
)

func main()  {
	ln, err := net.Listen("tcp", "127.0.0.1:8081")
	if err != nil {
		log.Println(err.Error())
	}
	aconns := make(map[net.Conn]int)
	conns := make(chan net.Conn)
	dconns := make(chan net.Conn)
	msgs := make(chan string)
	i := 0

	go func() {
		for {
			conn, err := ln.Accept()
			if err != nil {
				log.Println(err.Error())
			}
			conns <- conn
		}
	}()

	for {
		select {
		case conn := <-conns:
			aconns[conn] = i
			i++
			go func(conn net.Conn, i int) {
					rd := bufio.NewReader(conn)
					for {
						m, err := rd.ReadString('\n')
						if err != nil {
							break
						}
						msgs <- fmt.Sprintf("Client %v: %v", i, m)
					}
					dconns <- conn
			}(conn, i)
		case msg := <-msgs:
			for conn := range aconns {
				conn.Write([]byte(msg))
			}
		case dconn := <-dconns:
			log.Printf("Client %v is gone avay\n", aconns[dconn])
			delete(aconns, dconn)
		}
	}
}
