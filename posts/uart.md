# UART

The universal asynchronous receiver-transmitter (UART) protocol is one of the simplest protocols you can use to digitally transmit data over a wire. To send data from one device to another, you will need to connect the TX pin (where the T is for transmitter) on the transmitting device to the RX pin (where the R is for receiver) on the receiving device. The transmitting device drives the signal on the TX pin, while the receiving device senses the signal on the RX pin. So, if you want to send data both ways, you'll need two wires: One which connects the TX pin of the first device to the RX pin of the second device, and one that connects the TX pin of the second device to the RX pin of the first device.

![Schematic of two devices with an UART connection.](/images/connection.png)

This sounds very logical when you consider that the first letters in the TX and RX pins stand for transmitter and receiver. However, it is much more usual to just connect pins with the same name to each other, so it can be easy to accidentally so this wrong.

It is not possible to address a specific device with UART. If you want to connect more than two devices to each other, you will need to wire up each pair of devices. In this case you will have an RX and/or TX pin (depending on which ways you want to transmit data) for every connection between two devices. The only exception is when you want to send the same data to multiple devices, in which case you'll only need a single TX pin on the transmitting device.

Another thing you'll need to pay attention to, is that UART is a logic-level protocol. This means that it specifies things in terms of high and low voltages, without actually defining these voltages. Most modern microcontrollers use a voltage of 3.3V. Most desktop computers have a RS232 port, which is a form of UART. However, the RS232 port may use voltages up to ±15V. So connecting your desktops RS232 port to a microcontrollers IO ports might blow up the microcontroller (which sounds more spectucular than it is).

UART is a *serial* protocol, which means that the bits of the data that is to be transmitted, is transmitted sequentially (instead of using multiple connections to send multiple bits at once). UART is also *asynchronous*, which means that the transmitting and receiving device do not have a shared clock. However, the transmitting device has to transmit the bits at a frequency that is the same as the frequency at which the receiving device samples the channel. This frequency is called the *baud rate*, and the most commonly baud rates for UART are 19200 and 115200. Suppose we have a baud rate of 19200. If the transmitting device drives the communication channel low for 1/19200th of a second, I'll call this 'transmitting a 0'. Likewise, if the transmitting device drives the communication channel high for 1/19200th of a second, I'll call this 'transmitting a 1'.

Transmission happens in *packets*. If no transmission is happening, the transmitting device drives the signal on the communication channel high. If the transmitting device wants to transmit data, it should:
  1. Transmit a 0, which is called the *start bit*. This signals to the receiving device that the transmission of data is about to start.
  2. Transmit 5 to 9 (usually 8) *data bits*, which contain the actual data that is to be transmitted. The least significant bit is transmitted first. These need to be sampled and stored by the receiving device. 
  3. Optionally, transmit a parity bit, which can be used to check if the data is transmitted correctly.
  4. Transmit a 1. This is the *stop bit*. Sometimes, two stop bits are used.

![A timing diagram of a transmission using the UART protocol.](/images/uart.png)

Note that there is some freedom in the format. The transmitting and receiving device must use the same settings. These settings consist of the baud rate, number of data bits, the type of parity bit, and the number of stop bits. The most common settings are a baud rate of 115200, 8 data bits, no parity bit, and a single stop bit. Sometimes, the shorthand notation 115200/8N1 is used for these settings. Other possible settings for the parity bit are O for odd, and E for even, in which case the parity bit should be chosen so that it makes the total number of '1' bits (excluding the start and stop bits) odd, respectively even.

Ideally, the receiving device should sample the transmitted data bits in the middle between two transitions. For this, it needs to detect the transition from high to low, which happens when the start bit is transmitted, fairly quickly. Then, it can wait for 1.5 times the time it takes to transmit a bit, and sample the first data bit in the middle. In order to detect the start bit quickly, and to be able to sample the in the middle of the bit transmission, the clock rate of the receiving device needs to be a lot faster than the baud rate. Usually, a clock speed of 16 times the baud rate is used. Again, it's a little subtle when to start sampling. On average, the first detection of a low signal will happen half a clock cycle after the transition has happened. This means that, for a clock rate of 16 times the baud rate, you need to sample at 7.5 + 16 clock cycles later. This is troublesome, because we can only sample on clock transitions (so at integer multiples of clock cycles).

![Timing diagram for sampling when the clock speed is 16 times the baud rate.](/images/off_center.png)

Theoretically, you can take a clock speed that is an odd integer times the baud rate, and the center of the transmission of a bit will fall nicely on an integer multiple of a clock cycle.

![Timing diagram for sampling when the clock speed is 7 times the baud rate.](/images/sampling_center.png)

In practice, powers of two are usually used, and one of the two possibilities is picked. Often, the clock speed the device is running at is not a perfect multiple of the baud rate. In this case, you can sample early if the clock speed of your device is slightly too low, and sample late if the clock speed of your device is slightly too high.

## Clock precision

If your clock speed is not an exact multiple of the baud rate, you can usually still get away with using UART, if the clock speed does not deviate too much. The hand-wavy estimate is to say that we transmit 10 bits (with the most popular settings), and that, at the transmission of the last bit, we can only be off by half a bit (since we started sampling in the middle of a bit). So this would indicate that the clock speeds of the sending and the receiving device can be off by at most 5%. This means that the clock speed of an UART device can deviate at most 2.5% from the the theoretical clock speed (since the deviations of the transmitting and receiving device roughly add up).

In my experience, UART is easy to implement and set-up, and robust. Your mileage may vary. There are techniques to make UART more robust (such as the parity bit, which I haven't used in my implementation).
