function HowTo(params) {

    const width = params.ratio.width > 600 ? "80%" : "100%"

    return (
        <div
            className="howto"
            style={{
                backgroundColor: "rgba(0,0,0,0.8)",
                width: width,
                height: "100%",
                marginTop: "4vh",
                marginBottom: "4vh",
                borderRadius: "10px"
            }}
        >
            <p
                id="howto1"
            >This application is an open source chat based on end to end encryption
                <a
                    style={{
                        color: "inherit",
                        textDecoration: "underline"
                    }}
                    href="https://en.wikipedia.org/wiki/End-to-end_encryption"
                    target="_blank"
                    rel="noreferrer"
                > (wikipedia)</a>
            </p>
            <p
                id="howto2"
            >
                This means that only you can read messages sent to you, and only
                the recipient of the message you sent will be able to read their
                messages
            </p>
            <p
                id="howto3"
            >
                The server does not record the messages : once you left the room,
                everything is deleted, leaving no trace anywhere on your computer.
                Even if the server was secretly storing your messages without your
                consent, the server owner would be unable to decypher the messages,
                because of the way end to end encryption works
            </p>
            <p
                id="howto4"
            >The code for this application is available on <a
                style={{
                    color: "inherit",
                    textDecoration: "underline"
                }}
                href="https://github.com"
                rel="noreferrer"
                target="_blank">Github</a>
                , so you or someone with coding knowledge can verify it.
            </p>
            <p
                id="howto5"
            >
                Feel free to copy this program and use it on your own server,
                as long as you quote its creator, your humble servant : <a
                    href="https://cyrilmorin.fr"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                        color: "inherit",
                        textDecoration: "underline"
                    }}
                >Cyril Morin</a>
            </p>
            <p
                id="howto6"
            >
                If you have any question about this program, feel free to ask at : <a
                    href="mailto:cyril.morin.tai@gmail.com"
                    style={{
                        color: "inherit",
                        textDecoration: "underline"
                    }}
                >
                    cyril.morin.tai@gmail.com
                </a>
            </p>
        </div>
    )
}



export default HowTo;