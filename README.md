# fljota.network WebpackPwa phase 0 

The second 0.1.3 contains:

- RPi4 install instruction
- Updated webpack-pwa-manifest 4.3.0
- Fixed jpeg-js 0.4.2 for security reasons

The very first 0.1.2 contains:

- prototyped item inventory based on localbase / indexedDB
- PWA manifest with service-worker
- Phoenix Channel for item counting
- Sensor API Dummy


## How to start your Phoenix dev server (the short version)

  * Install dependencies with `mix deps.get`
  * Install Node.js dependencies with `npm install` inside the `assets` directory
  * Start Phoenix endpoint with `mix phx.server`

DEV is configured vor both http: and https: for sensor permissions

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

## How to install fljota.pwa on your rpi4 ubuntu 20.04 for local dev?

1. Check your Ubuntu Version
lsb_release -d

2. Check your Elixir Version
elixir -v

3. Install latest Elixir
sudo apt install elixir

4. Check your Elixir version again:
 elixir -v

5. Clone this Repo to your filesystem
git clone https://github.com/fljota/pwa.git

6. Change Directory to your local copy
cd pwa

7. You need to install all needed npm packages in the asset Directory
cd assets/

8. Install all Packages
npm install

9. If you haven't installed npm
sudo apt install npm

10. Now you can install all needed packages (this may take a while on a rpi4)
npm install

11. Jump back
cd ..

12. Try to Launch the Pheonix Dev Server
mix phx.server

13. Oh. You need all the MIX Dependencise
mix deps.get

14. If everything went correct you can now start your localhost:4000
mix phx.server

15. If any further errors occour, take time to fix them
:-) Sorry - Work in progress


The fljota.network PWA is based on Elixir Phoenix
