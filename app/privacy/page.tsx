export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-black text-gray-200 flex flex-col items-center px-6 py-30">
      {/* Container */}
      <div className="max-w-3xl text-center ">
        {/* Heading */}
        <h1 className="text-4xl font-extrabold mb-8">Privacy Policy</h1>

        {/* First Paragraph */}
        <p className="mb-6 leading-relaxed text-gray-300">
         Spectra was developed as an open source app powered by the
          Spotify Music Web API. By choosing to use this app, you
          agree to the use of your Spotify account username and data for your top
          artists and tracks.
        </p>

        {/* Second Paragraph */}
        <p className="mb-6 leading-relaxed text-gray-300">
          None of the data used by Spectra is stored or collected anywhere,
          and it is <span className="font-semibold text-white">NOT</span> shared with
          any third parties. All information is used solely for displaying your
          results.
        </p>

        {/* Third Paragraph */}
        <p className="mb-10 leading-relaxed text-gray-300">
          Although you can rest assured that your data is not being stored or used
          maliciously, if you would like to revoke Spectra's permissions, you
          can visit{" "}
          <a
            href="https://www.spotify.com/account/apps/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-400 hover:underline"
          >
            your apps page
          </a>{" "}
          and click <span className="font-semibold">"REMOVE ACCESS"</span>.{" "}
          <a
            href="https://support.spotify.com/us/article/spotify-on-other-apps/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-400 hover:underline"
          >
            Here
          </a>{" "}
          is a more detailed guide for doing so.
        </p>

        {/* Footer */}
        <div className="mt-8 text-center border-t border-gray-800 pt-6">
          <p className="text-gray-400">
            Made by{" "}
            <a
              href="https://www.linkedin.com/in/arpit-kukreti-4a3824302/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 hover:underline"
            >
              Arpit Kukreti
            </a>
          </p>
          <div className="mt-3 space-x-4">
            <a href="/" className="text-green-400 hover:underline">
              Home
            </a>
          
            <a href="/privacy" className="text-green-400 hover:underline">
              Privacy Policy
            </a>
            
          </div>
        </div>
      </div>
    </div>
  );
}
