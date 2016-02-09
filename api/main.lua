-- This is a stub that allows running server.lua using normal lua or luajit
-- For PUC lua:
--
--   luarocks luv luabitop
--   lua main.lua
--
-- For luajit:
--
-- build luv from source and copy `luv.so` to package.cpath
--
--  luajit main.lua
--
-- For luvit: (skip this file)
--
--   luvit server.lua
--
dofile("luvit-loader.lua")
require('./server')
require('uv').run()

-- Memory comparisions running server on different platforms

-- On OSX
-- luvit(v2.9.1) 6.5MB
-- luajit(v2.0.4-homebrew) 5.0MB
-- lua(v5.2.4-homebrew) 12.3 MB
