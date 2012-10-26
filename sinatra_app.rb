# encoding: UTF-8
require 'rubygems'
require 'compass'
require 'sass'
require 'sinatra'
require "sinatra/reloader" if development?
require 'coffee-script'
require 'sinatra/base'
require 'dalli'

set :cache, Dalli::Client.new
set :enable_cache, true
set :short_ttl, 400
set :long_ttl, 4600

get "/js/*.js" do
  require './assets_compiler.rb'
  filename = params[:splat].first
  compile_asset_with_cache(filename, "javascript")
end

get "/css/*.css" do
  configure do
    Compass.configuration do |config|
      config.project_path = File.dirname(__FILE__)
      config.sass_dir = 'assets/sass'
    end

    set :haml, { :format => :html5 }
    set :sass, Compass.sass_engine_options
  end
  require './assets_compiler.rb'
  filename = params[:splat].first
  compile_asset_with_cache(filename, "css")
end

get '/' do
    @pass_to_view = "Hej världen!"
    set :public_folder, File.dirname(__FILE__) + '/public'
    set :views, File.dirname(__FILE__) + '/views'
    haml :index
end