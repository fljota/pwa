defmodule WebpackPwaWeb.PageController do
  use WebpackPwaWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end
end
