#!/bin/bash
cat > /etc/udev/rules.d/99-led-badge-44x11.rules << EOF
SUBSYSTEM=="usb", ATTRS{idVendor}=="0416", ATTRS{idProduct}=="5020", MODE="0666"
KERNEL=="hidraw*", ATTRS{idVendor}=="0416", ATTRS{idProduct}=="5020", MODE="0666"
EOF
udevadm control --reload-rules && udevadm trigger
echo "Done. Unplug and re-plug the badge."
