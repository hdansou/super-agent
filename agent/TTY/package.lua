return {
  name = "super-agent",
  private=true,
  version = "0.0.1",
  description = "agent with tty",
  tags = { "lua", "luvit" },
  author = { name = "Adam", email = "harageth@gmail.com" },
  homepage = "https://github.com/virgo-agent-toolkit/super-agent",
  dependencies = {'creationix/coro-channel',
    'creationix/coro-split'},
  files = {
    "**.lua",
    "!test*"
  }
}