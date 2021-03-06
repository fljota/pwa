defmodule WebpackPwaWeb.ItemCountChannel do
  use WebpackPwaWeb, :channel

  @impl true
  def join("item_count:total", _payload, socket) do
       {:ok, socket}
  end

 # Handles the published total amount of all items in the fljota.network
  @impl true
  def handle_in("total", payload, socket) do
    broadcast!(socket, "total", payload)
    {:reply, {:ok, payload}, socket}
  end


  # Channels can be used in a request/response fashion
  # by sending replies to requests from the client
  @impl true
  def handle_in("ping", payload, socket) do
    {:reply, {:ok, payload}, socket}
  end

  # It is also common to receive messages from the client and
  # broadcast to everyone in the current topic (item_count:lobby).
  @impl true
  def handle_in("shout", payload, socket) do
    broadcast socket, "shout", payload
    {:noreply, socket}
  end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end
