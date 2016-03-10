local bundle = require('luvi').bundle
loadstring(bundle.readfile("luvit-loader.lua"), "bundle:luvit-loader.lua")()
local p = require('pretty-print').prettyPrint
local platform = require('platform')

local agentId = "fc1eb9f7-69f0-4079-9e74-25ffd091022a"
local token = "d8e92bcf-2adf-4bd7-b570-b6548e2f6d5f"

local wsConnect = require('websocket-client')
local makeRpc = require('rpc')
local codec = require('websocket-to-message')
local registry = require('registry')()
local register = registry.register
local String = registry.String
local Function = registry.Function
local Optional = registry.Optional
local Int = registry.Int
local Number = registry.Number
local NamedTuple = registry.NamedTuple
local Bool = registry.Bool

assert(register("scandir", "Reads a directory, calling onEntry for each name/type pair", {
  {"path", String},
  {"onEntry", Function},
}, {
  {"exists", Bool},
}, platform.scandir))

assert(register("echo", "Echo testing streams", {
  {"data", Function}
}, {
  {"data", Function}
}, platform.echo))

assert(register("readstream", "Read a file in 1024 byte chunks", {
  {"path", String},
  {"data", Function},
}, {
  {"exists", Bool},
}, platform.readstream))

assert(register("readfile", "Read a file, but buffer all the chunks", {
  {"path", String},
}, {
  {"data", Optional(String)},
}, platform.readfile))

assert(register("readlink", "Read the target of a symlink", {
  {"path", String},
}, {
  {"target", Optional(String)},
}, platform.readlink))

assert(register("writestream", "Write a file in chunks, pass nill to end", {
  {"path", String},
  {"error", Function},
}, {
  {"data", Function},
}, platform.writestream))

assert(register("writefile", "Write a file from a buffer", {
  {"path", String},
  {"data", String},
}, {
  {"created", Bool}
}, platform.writefile))

assert(register("symlink", "Create a symlink", {
  {"target", String},
  {"path", String},
}, {}, platform.symlink))

assert(register("mkdir", "Create a directory, optionally creating parents", {
  {"path", String},
  {"recursive", Bool},
}, {
  {"created", Bool},
}, platform.mkdir))

assert(register("unlink", "Remove a file", {
  {"path", String},
}, {
  {"existed", Bool},
}, platform.unlink))

assert(register("rmdir", "Remove an empty directory", {
  {"path", String},
}, {
  {"existed", Bool},
}, platform.rmdir))

assert(register("rm", "Remove a file or directory (optionally recursivly)", {
  {"path", String},
  {"recursive", Bool},
}, {
  {"existed", Bool},
}, platform.rm))

assert(register("lstat", "Get stats for a file or directory", {
  {"path", String},
}, {
  {"stat", Optional(NamedTuple{
    {"mtime", Number},
    {"atime", Number},
    {"size", Int},
    {"type", String},
    {"mode", Int},
    {"uid", Int},
    {"gid", Int},
  })}
}, platform.lstat))

assert(register("chmod", "Change the mode/permissions of a file", {
  {"path", String},
  {"mode", Int},
}, {}, platform.chmod))

assert(register("chown", "Change the user id and group id of a file", {
  {"path", String},
  {"uid", Int},
  {"gid", Int},
}, {}, platform.chown))

assert(register("utime", "Update access and modification times for a file", {
  {"path", String},
  {"atime", Number},
  {"mtime", Number},
}, {}, platform.utime))

assert(register("rename", "Rename or move a file", {
  {"path", String},
  {"newPath", String},
}, {}, platform.rename))

assert(register("realpath", "Gets the realpath by resolving symlinks", {
  {"path", String},
}, {
  {"fullPath", String}
}, platform.realpath))

assert(register("diskusage", "Calculate diskusage of folders and subfolders", {
  {"path", String},
  {"depth", Int},
  {"onEntry", Function},
  {"onError", Function}
}, {
  {"exists", Bool},
}, platform.diskusage))

if platform.user then
  assert(register("user", "Get username from user id", {
    {"uid", Int},
  }, {
    {"username", Optional(String)},
  }, platform.user))
end

if platform.group then
  assert(register("group", "Get group from group id", {
    {"gid", Int},
  }, {
    {"group", Optional(String)},
  }, platform.group))
end

if platform.uid then
  assert(register("uid", "Get user id from username", {
    {"username", String},
  }, {
    {"uid", Optional(Int)},
  }, platform.uid))
end

if platform.gid then
  assert(register("gid", "Get user id from group name", {
    {"group", String},
  }, {
    {"gid", Optional(Int)},
  }, platform.gid))
end

-- pty(
--   shell: String,
--   uid: Integer,
--   gid: Integer,
--   cols: Integer,
--   rows: Integer,
--   onTitle: Function(title: String),
--   onOut: Function(chunk: Buffer),
--   onExit: Function()
-- ) -> error: Optional(String),
--      write: Function(chunk: Buffer),
--      close: Function(error: Optional(String)),
--      resize: Function(cols: Integer, rows: Integer)


local function log(...)
  p("log", ...)
end

coroutine.wrap(function ()
  local url = "ws://localhost:8000/enlist/" .. agentId .. "/" .. token
  local read, write = assert(wsConnect(url , "schema-rpc", {}))
  read, write = codec(read, write)
  makeRpc(registry.call, log, read, write).readLoop()
end)()

require('uv').run()
