# Eccles Mosque Icon Font

## How to add/remove icons from the icon font

This instruction assumes you have already followed the getting started guide in the main README.md

Icons bundle is created using fontello icon front generator.
The base configuration can be seen in `_assets/icons/config.json`.

- Run `npm run update-icons` or `fontello-cli open --config ./_assets/icons/config.json` to start a [Fontello - icon font scissors](http://fontello.com) session with current configuration loaded.
- Select/Unselect icons as desired
- When done, find the `Save session` button on top right corner
- Use the drop down menu `Get Config Only` option on `Save Session` button to download the `config.json` and replace the copy found in this directory.

## How to download a new icons set

- Run `npm run download-icons` or
- Run `fontello-cli install --config ./_assets/icons/config.json --font ./assets/fonts --css ./_assets/styles/icons`
