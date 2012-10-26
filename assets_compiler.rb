# encoding: UTF-8
def compile_asset_with_cache(filename, type)
  if type == "javascript"
    set :views, File.dirname(__FILE__) + '/assets/coffee'
    file_modified = File.mtime(File.dirname(__FILE__) + "/assets/coffee/#{filename.to_s}.coffee").to_i
  end
  if type == "css"
    set :views, File.dirname(__FILE__) + '/assets/sass'
    file_modified = File.mtime(File.dirname(__FILE__) + "/assets/sass/#{filename.to_s}.sass").to_i
  end

  if(settings.cache.get(filename.to_s) == nil || settings.cache.get("mtime_" << filename.to_s) == nil || settings.cache.get("mtime_" << filename.to_s) < file_modified)

    build_comp = coffee filename.to_sym if type == "javascript"
    build_comp = sass filename.to_sym if type == "css"

    settings.cache.set(filename.to_s, build_comp.to_s)
    settings.cache.set("mtime_" << filename.to_s, file_modified)

  else
    build_comp = settings.cache.get(filename.to_s)
  end
  return build_comp
end