const UTF8Decoder = new TextDecoder()

export interface SaxoBankMessage {
  readonly messageId: number
  readonly referenceId: string
  readonly payload: unknown
}

/**
 * Parse the incoming messages. Documentation on message format: https://www.developer.saxo/openapi/learn/plain-websocket-streaming#PlainWebSocketStreaming-Receivingmessages
 * @param data The received stream message
 * @returns Returns an array with all incoming messages of the frame
 */
export function parseSaxoBankMessage(data: ArrayBuffer): readonly SaxoBankMessage[] {
  const message = new DataView(data)
  const parsedMessages: SaxoBankMessage[] = []

  let index = 0

  while (index < data.byteLength) {
    /*
     * Message identifier (8 bytes)
     * 64-bit little-endian unsigned integer identifying the message.
     * The message identifier is used by clients when reconnecting. It may not be a sequence number and no interpretation
     * of its meaning should be attempted at the client.
     */
    const messageId = fromBytesLe(new Uint8Array(data, index, 8))
    index += 8
    /*
     * Version number (2 bytes)
     * Ignored in this example. Get it using 'messageEnvelopeVersion = message.getInt16(index)'.
     */
    index += 2
    /*
     * Reference id size 'Srefid' (1 byte)
     * The number of characters/bytes in the reference id that follows.
     */
    const referenceIdSize = message.getInt8(index)
    index += 1
    /*
     * Reference id (Srefid bytes)
     * ASCII encoded reference id for identifying the subscription associated with the message.
     * The reference id identifies the source subscription, or type of control message (like '_heartbeat').
     */
    const referenceIdBuffer = new Int8Array(data, index, referenceIdSize)
    const referenceId = String.fromCharCode.apply(String, referenceIdBuffer as unknown as number[])
    index += referenceIdSize
    /*
     * Payload format (1 byte)
     * 8-bit unsigned integer identifying the format of the message payload. Currently the following formats are defined:
     *  0: The payload is a UTF-8 encoded text string containing JSON.
     *  1: The payload is a binary protobuffer message.
     * The format is selected when the client sets up a streaming subscription so the streaming connection may deliver a mixture of message format.
     * Control messages such as subscription resets are not bound to a specific subscription and are always sent in JSON format.
     */
    const payloadFormat = message.getUint8(index)
    index += 1
    /*
     * Payload size 'Spayload' (4 bytes)
     * 32-bit unsigned integer indicating the size of the message payload.
     */
    const payloadSize = message.getUint32(index, true)
    index += 4
    /*
     * Payload (Spayload bytes)
     * Binary message payload with the size indicated by the payload size field.
     * The interpretation of the payload depends on the message format field.
     */
    const payloadBuffer = new Uint8Array(data, index, payloadSize)

    switch (payloadFormat) {
      case 0: {
        // JSON
        const payload = JSON.parse(UTF8Decoder.decode(payloadBuffer))

        parsedMessages.push({
          messageId,
          referenceId,
          payload,
        })

        break
      }
      case 1: {
        // ProtoBuf
        throw new Error('Protobuf is not covered by this sample')
      }

      default: {
        throw new Error('Unsupported payloadFormat: ' + payloadFormat)
      }
    }

    index += payloadSize
  }

  return parsedMessages
}

/**
 * Creates a Long from its little endian byte representation (function is part of long.js - https://github.com/dcodeIO/long.js).
 * @param bytes Little endian byte representation
 * @param unsigned Whether unsigned or not, defaults to signed
 * @returns The corresponding Long value
 */
function fromBytesLe(bytes: Uint8Array, unsigned: undefined | boolean = false) {
  const [byte0, byte1, byte2, byte3, byte4, byte5, byte6, byte7] = bytes as unknown as [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
  ]

  const low = (byte0 | byte1 << 8 | byte2 << 16 | byte3 << 24) | 0
  const high = (byte4 | byte5 << 8 | byte6 << 16 | byte7 << 24) | 0
  const twoPwr16Dbl = 1 << 16
  const twoPwr32Dbl = twoPwr16Dbl * twoPwr16Dbl

  if (unsigned) {
    return (high >>> 0) * twoPwr32Dbl + (low >>> 0)
  }

  return high * twoPwr32Dbl + (low >>> 0)
}
