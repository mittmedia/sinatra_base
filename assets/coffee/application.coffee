window.initDisplayAds = (images) ->
  window.container.image_inventory = new ImageStack
  for img, i in images
    img.id = i
    window.container.image_inventory.push img
  window.container.render()

  return

class ImageStack
  constructor: (arr = []) ->
    @list = arr
    @height = null

  shuffle: () ->
    @list = @list.sort -> 0.5 - Math.random()

  list: ->
    @list

  push: (item) ->
    @list.push item

  empty: ->
    @list.length == 0
  # removes and returns a single item from the stack, slightly shorter than max_height
  shorter_than: (max_height) ->
    # filter items with shorter heights than max_height
    short_list = @list.filter (obj) ->
      obj.image_height <= max_height
    # sort items by height
    short_list = short_list.sort (a,b) ->
      b.image_height - a.image_height
    # get the tallest item
    item = short_list[0]
    @list.splice(@list.indexOf(item), 1)
    @height = null
    item

  # gets the total height of all items in this stack
  total_height: ->
    if @height
      return @height
    @height = 0
    for item in @list
      @height += item.image_height
    @height

  # divides the stack into <count> stacks, each of close to <max_height> height
  partition: (count = 3, max_height = 1000) ->
    if @empty()
      return false
    stacks = []
    for i in [0...count]
      stack = new ImageStack
      column_space = max_height
      while(column_space > 0)
        item = @shorter_than(column_space)
        if item
          column_space -= item.image_height
          stack.push(item)
        else
          column_space = 0
      stacks.push(stack)
    stacks.sort -> 0.5 - Math.random()

class TileView
  constructor: (url, @parent) ->

    container = document.createElement('div')
    jQuery(container).attr("id","tiles_collection")
    jQuery("##{@parent}").append(container)
    @menu_parent = @parent
    @parent = jQuery("#tiles_collection")

    @generate_menu()

    @generate(url)

  select_menu_item: (item,listmenu) ->
    window.container.parent.html("")
    window.container.generate("http://service.dt.se/ads/ads/dt/#{jQuery(item).attr("id")}.js")
    jQuery(listmenu).children().attr("class", "")
    jQuery(item).attr("class", "selected")

  generate_menu: ->
    d = new Date()

    listmenu = document.createElement('ul')
    jQuery(listmenu).attr("id","stacker_menu")

    jQuery(@parent).before(listmenu)

    listitem = document.createElement('li')
    jQuery(listitem).html("Senaste")
    jQuery(listitem).attr("id","latest_ads")
    jQuery(listitem).attr("class", "selected")
    jQuery(listitem).click () ->
      window.container.select_menu_item(@,listmenu)
    jQuery(listmenu).append(listitem)

    days = ["sunday","monday","tuesday","wednesday","hhursday","friday","saturday","sunday"]

    i = 0
    while i < 6
      i++
      d = new Date()
      d.setDate(d.getDate()-i)
      listitem = document.createElement('li')
      day = d.getDate()
      day = "0#{day}" if day < 10

      jQuery(listitem).html("#{d.getFullYear()}-#{d.getMonth() + 1}-#{day}")
      jQuery(listitem).attr("id","#{days[d.getDay()]}")
      jQuery(listitem).click () ->
        window.container.select_menu_item(@,listmenu)
      jQuery(listmenu).append(listitem)

  get_block: (column_count, preferred_height) ->

    if ((@remaining_inventory_space / column_count)) < preferred_height
      preferred_height += @remaining_inventory_space / column_count



    stacks = @image_inventory.partition(column_count, preferred_height)

    if stacks
      @remaining_inventory_space = @image_inventory.total_height()


    stacks

  render: ->
    @remaining_inventory_space = @image_inventory.total_height()
    preferred_height = 900
    blocks = []

    minimum_height = 0


    while image_block = @get_block(3, preferred_height)
      minimum_height =  Math.round(image_block[0].total_height() + image_block[1].total_height() + image_block[2].total_height()) / 3
      block_container = document.createElement('div')
      jQuery(block_container).attr("class", "block_container")
      blocks.push(block_container)

      for image_stack in image_block
        img_height = 0
        column_container = document.createElement('div')
        jQuery(column_container).addClass("image_column")
        jQuery(column_container).addClass("column_#{_i}")
        jQuery(column_container).attr("id","height_#{Math.round(image_stack.total_height())}")

        jQuery(block_container).append(column_container)
        preferred_height = Math.round(minimum_height)
        jQuery(block_container).attr("id","height_#{preferred_height}")

        if image_stack.list.length == 1
          img_height = preferred_height

        if image_stack.list.length > 1
          margin = Math.round((preferred_height + 7) - image_stack.total_height())
          margin = Math.round(margin / (image_stack.list.length - 1))

        if margin < 0
          margin = 1

        image_stack.shuffle()
        for item, i in image_stack.list
          img = document.createElement('img')
          jQuery(img).attr("src","#{item.image}")
          jQuery(img).attr("id","img_#{item.id}")
          jQuery(img).attr("alt",item.url)
          jQuery(img).attr("height","#{item.image_height}")

          jQuery(img).click () ->
            window.open(jQuery(this).attr("alt"))

          jQuery(img).attr("width","#{item.image_width}")
          if i < (image_stack.list.length - 1)
            jQuery(img).attr("style", "margin-bottom: #{Math.round(margin)}px")
          jQuery(column_container).append(img)


    blocks = blocks.sort -> 0.5 - Math.random()
    for block in blocks
      @parent.append(block)

  generate: (url) ->
    jQuery.ajax({
      type: "GET",
      url: url,
      dataType: "script"
    })
    return

jQuery ->
  remote_json = "http://service.dt.se/ads/ads/dt/latest_ads.js"
  window.container = new TileView(remote_json, "wrapper")
  #window.container = new TileView(remote_json, "AttentionTeaserWrapper")

	return

class SingleAdView
  constructor: (url, @parent, @linkto) ->
    @parent = jQuery("##{@parent}")
    infofield = document.createElement('div')
    @parent.append(infofield)
    jQuery(infofield).attr("id","ad_info")
    jQuery(infofield).attr("style","text-align: center; background-color: #CCC; margin-bottom: 2px;")

    adslink = document.createElement('a')
    jQuery(adslink).attr("href",@linkto)
    jQuery(adslink).attr("target","_self")
    jQuery(adslink).attr("style","text-decoration: none; color: #333; font-weight: bold; font-size: 13px;")
    jQuery(adslink).html("Se fler tidningsannonser &raquo;")

    jQuery(infofield).append(adslink)


    console.log url
    @generate(url)

  generate: (url) ->
    jQuery.ajax({
      type: "GET",
      url: url,
      dataType: "script",
      timeout: 10000
    })
    return
  viewImage: (item, url) ->
    img = document.createElement('img')
    item.image = "#{url}#{item.image}"
    item.url = "#{url}#{item.url}"
    jQuery(img).attr("src","#{item.image}")
    jQuery(img).attr("alt","Klicka p annonsen fr att visa den i ett nytt fnster.")
    jQuery(img).attr("title","Klicka p annonsen fr att visa den i ett nytt fnster.")
    jQuery(img).attr("longdesc",item.url)
    jQuery(img).attr("style","width:278px;height:auto;margin-bottom:6px; border: 1px solid #555; cursor: pointer")
    jQuery(img).click () ->
      window.open(jQuery(this).attr("longdesc"))
    @parent.append(img)
    return


jQuery ->
  remote_json = "http://files.mittmedia.se/print-webb/dt/latest_ads_random.js"
  window.initDisplayAdsRandom = (url, images) ->
    setTimeout ->
      window.single_ad_container.viewImage images[Math.floor(Math.random()*images.length)], url
      , 1000
    return

  window.single_ad_container = new SingleAdView(remote_json, "single_ad_view", "http://www.dt.se/service/annonser")
  return

 window.initDisplayAds = (url, images) ->
  for img, i in images
    img.id = i
    img.url = "#{url}#{img.url}"
    img.image = "#{url}#{img.image}"
    window.container.image_inventory.push img
  window.container.render()

  return

class ImageStack
  constructor: (arr = []) ->
    @list = arr

  shuffle: () ->
    @list = @list.sort -> 0.5 - Math.random()
    return

  list: ->
    @list

  push: (item) ->
    @list.push item

  add_stack: (stack) ->
    for item in stack.list
      @push item
    return

  empty: ->
    @list.length == 0
  # removes and returns a single item from the stack, slightly shorter than max_height

  tallest: ->
    list_by_height = @list.sort (a, b) ->
      b.image_height - a.image_height
    list_by_height[0]

  remove_tallest: () ->
    tallest = @tallest()
    @list.splice(@list.indexOf(tallest), 1)
    tallest

  shorter_than: (max_height) ->
    # filter items with shorter heights than max_height
    short_list = @list.filter (obj) ->
      obj.image_height <= max_height
    return false if short_list.length == 0

    # sort items by height
    short_list = short_list.sort (a,b) ->
      b.image_height - a.image_height
    # get the tallest item
    item = short_list[0]
    @list.splice(@list.indexOf(item), 1)
    return item

  # gets the total height of all items in this stack
  total_height: ->
    height = 0
    for item in @list
      height += item.image_height
    height

  partition_evenly: (column_count) ->
    stacks  = []
    for i in [0...column_count]
      stacks[i] = new ImageStack()
    while not @empty()
      stacks = stacks.sort (a,b) ->
        a.total_height() - b.total_height()
      stacks[0].push @remove_tallest()
    return stacks

  # divides the stack into <count> stacks, each of close to <max_height> height
  partition: (count = 3, max_height = 1000) ->
    if @empty()
      return false
    stacks = []
    for i in [0...count]
      stack = new ImageStack
      column_space = max_height
      while(column_space > 0)
        item = @shorter_than(column_space)
        if item
          column_space -= item.image_height
          stack.push(item)
        else
          column_space = 0
      stacks.push(stack)
    stacks
    stacks.sort -> 0.5 - Math.random()

class TileView
  constructor: (@url, file, @parent) ->
    @image_inventory = new ImageStack
    container = document.createElement('div')
    jQuery(container).attr("id","tiles_collection")
    jQuery("##{@parent}").append(container)
    @menu_parent = @parent
    @parent = jQuery("#tiles_collection")

    @generate_menu()

    @generate("#{@url}#{file}")

  select_menu_item: (item,listmenu) ->
    window.container.parent.html("")
    window.container.generate("#{@url}#{jQuery(item).attr("id")}.js")
    jQuery(listmenu).children().attr("class", "")
    jQuery(item).attr("class", "selected")
    return

  menu_item_hover: (item, event) ->
    if event == "in"
      jQuery(item).attr("style", "background-color: #555")
    else
      jQuery(item).removeAttr("style")
    return


  generate_menu: ->
    listmenu = document.createElement('ul')
    jQuery(listmenu).attr("id","stacker_menu")

    jQuery(@parent).before(listmenu)

    listitem = document.createElement('li')
    jQuery(listitem).html("Senaste")
    jQuery(listitem).attr("id","latest_ads")
    jQuery(listitem).attr("class", "selected")

    jQuery(listitem).click () ->
      window.container.select_menu_item(@,listmenu)

    jQuery(listitem).mouseenter () ->
      window.container.menu_item_hover(@,"in")

    jQuery(listitem).mouseleave () ->
      window.container.menu_item_hover(@,"out")

    jQuery(listmenu).append(listitem)

    days = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday","sunday"]

    i = 0
    while i < 6
      i++
      d = new Date()
      d.setDate(d.getDate()-i)
      listitem = document.createElement('li')
      day = d.getDate()
      day = "0#{day}" if day < 10

      jQuery(listitem).html("#{d.getFullYear()}-#{d.getMonth() + 1}-#{day}")
      jQuery(listitem).attr("id","#{days[d.getDay()]}")
      jQuery(listitem).click () ->
        window.container.select_menu_item(@,listmenu)
      jQuery(listitem).mouseenter () ->
        window.container.menu_item_hover(@,"in")

      jQuery(listitem).mouseleave () ->
        window.container.menu_item_hover(@,"out")
      jQuery(listmenu).append(listitem)

  get_block: (column_count) ->
    return false if @image_inventory.empty()
    default_height = 950
    tallest_height = @image_inventory.tallest().image_height
    max_height = if tallest_height > default_height then tallest_height else default_height

    remaining_inventory_height = @image_inventory.total_height()
    stacks = @image_inventory.partition(column_count, max_height)

    if @image_inventory.empty()
      temp_stack = new ImageStack()
      for stack in stacks
        temp_stack.add_stack(stack)
      stacks = temp_stack.partition_evenly(column_count)
    stacks

  render: ->
    blocks = []
    count = 0
    minimum_height = 0

    # Retrives block with columns
    while image_block = @get_block(3)

      block_container = document.createElement('div')
      jQuery(block_container).attr("class", "block_container")
      blocks.push(block_container)

      tallest_stack_height = (image_block.sort (a,b) ->
        b.total_height() - a.total_height())[0].total_height()

      # Render column
      for image_stack in image_block
        img_height = 0
        column_container = document.createElement('div')
        jQuery(column_container).addClass("image_column")
        jQuery(column_container).addClass("column_#{_i}")
        jQuery(block_container).append(column_container)

        margin = 0
        if image_stack.list.length > 1
          margin += ((tallest_stack_height + 10) - image_stack.total_height()) / (image_stack.list.length - 1)
          margin = Math.round(margin)

        image_stack.shuffle()

        # Render image
        for item, i in image_stack.list
          count++
          img = document.createElement('img')
          jQuery(img).attr("src","#{item.image}")
          jQuery(img).attr("id","img_#{item.id}")
          jQuery(img).attr("alt","Klicka p annonsen fr att ppna den i ett nytt fnster")
          jQuery(img).attr("title","Klicka p annonsen fr att ppna den i ett nytt fnster")
          jQuery(img).attr("longdesc",item.url)
          jQuery(img).attr("height","#{item.image_height}")

          jQuery(img).click () ->
            window.open(jQuery(this).attr("longdesc"))

          jQuery(img).attr("width","#{item.image_width}")
          if i < (image_stack.list.length - 1)
            jQuery(img).attr("style", "margin-bottom: #{Math.round(margin)}px")
          jQuery(column_container).append(img)


    blocks = blocks.sort -> 0.5 - Math.random()
    for block in blocks
      @parent.append(block)

  generate: (url) ->
    jQuery.ajax({
      type: "GET",
      url: url,
      dataType: "script"
    })
    return

jQuery ->
  remote_json_url = "http://files.mittmedia.se/print-webb/dt/"
  remote_json_file = "latest_ads.js"
  #window.container = new TileView(remote_json, "wrapper")
  window.container = new TileView(remote_json_url, remote_json_file, "AttentionTeaserWrapper")
	return