define('libs/mime', function () {
  'use strict';
  var files = {
    Vagrantfile: 'text/x-ruby',
    Gemfile: 'text/x-ruby',
    Berksfile: 'text/x-ruby',
    Rakefile: 'text/x-ruby',
    SConstruct: 'text/x-python',
    Dockerfile: 'text/x-dockerfile',
    Makefile: 'text/x-sh',
    'nginx.conf': 'text/x-nginx-conf',
    README: 'text/plain',
    LICENSE: 'text/plain',
    INSTALL: 'text/plain',
    CHANGES: 'text/plain',
    NOTICE: 'text/plain',
  };
  var extensions = {
    js: 'application/javascript',
    json: 'application/json',
    webapp: 'application/json',
    ts: 'application/typescript',
    lua: 'text/x-lua',
    html: 'text/html',
    xml: 'text/xml',
    rb: 'text/x-ruby',
    c: 'text/x-c',
    h: 'text/x-chdr',
    sh: 'text/x-sh',
    css: 'text/css',
    elm: 'text/x-elm',
    // -- bat
    rs: 'text/x-rustsrc',
    py: 'text/x-python',
    scons: 'text/x-python',
    go: 'text/x-go',
    md: 'text/x-markdown',
    markdown: 'text/x-markdown',
    yml: 'text/x-yaml',
    toml: 'text/x-toml',
    ini: 'text/x-toml',
    pem: 'application/pgp',
    cert: 'application/pgp',
    key: 'application/pgp',
    sql: 'text/x-sql',
    php: 'application/x-httpd-php',
    scala: 'text/x-scala',
    cs: 'text/x-csharp',
    'java': 'text/x-java',
    cpp: 'text/x-c++src',
    hpp: 'text/x-c++hdr',
    pl: 'text/x-perl',
    pp: 'text/x-puppet',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    gz: 'application/x-compressed',
    zip: 'application/zip',
    bz: 'application/x-compressed',
    tgz: 'application/x-compressed',
    txt: 'text/plain',
    wav: 'audio/wav',
    mp3: 'audio/mpeg3',
    aac: 'audio/x-aac',
    mpeg: 'video/mpeg',
    mp4: 'video/mp4',
    flv: 'video/x-flv',
    avi: 'video/x-msvideo',
    wmv: 'video/x-ms-wmv',
  };

  return function (path, defaultMime) {
    return files[path.match(/[^/]*$/)[0]] ||
      extensions[path.match(/[^/.]*$/)[0]] ||
      defaultMime;
  };
});
