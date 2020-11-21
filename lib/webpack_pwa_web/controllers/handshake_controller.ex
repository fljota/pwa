defmodule WebpackPwaWeb.HandshakeController do
    use WebpackPwaWeb, :controller
  
    def handshake(conn, _params) do
      render(conn, "handshake.html")
    end
  end
  