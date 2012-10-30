(function() {
  var ImageStack, SingleAdView, TileView;

  window.initDisplayAds = function(images) {
    var i, img, _i, _len;
    window.container.image_inventory = new ImageStack;
    for (i = _i = 0, _len = images.length; _i < _len; i = ++_i) {
      img = images[i];
      img.id = i;
      window.container.image_inventory.push(img);
    }
    window.container.render();
  };

  ImageStack = (function() {

    function ImageStack(arr) {
      if (arr == null) {
        arr = [];
      }
      this.list = arr;
      this.height = null;
    }

    ImageStack.prototype.shuffle = function() {
      return this.list = this.list.sort(function() {
        return 0.5 - Math.random();
      });
    };

    ImageStack.prototype.list = function() {
      return this.list;
    };

    ImageStack.prototype.push = function(item) {
      return this.list.push(item);
    };

    ImageStack.prototype.empty = function() {
      return this.list.length === 0;
    };

    ImageStack.prototype.shorter_than = function(max_height) {
      var item, short_list;
      short_list = this.list.filter(function(obj) {
        return obj.image_height <= max_height;
      });
      short_list = short_list.sort(function(a, b) {
        return b.image_height - a.image_height;
      });
      item = short_list[0];
      this.list.splice(this.list.indexOf(item), 1);
      this.height = null;
      return item;
    };

    ImageStack.prototype.total_height = function() {
      var item, _i, _len, _ref;
      if (this.height) {
        return this.height;
      }
      this.height = 0;
      _ref = this.list;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        this.height += item.image_height;
      }
      return this.height;
    };

    ImageStack.prototype.partition = function(count, max_height) {
      var column_space, i, item, stack, stacks, _i;
      if (count == null) {
        count = 3;
      }
      if (max_height == null) {
        max_height = 1000;
      }
      if (this.empty()) {
        return false;
      }
      stacks = [];
      for (i = _i = 0; 0 <= count ? _i < count : _i > count; i = 0 <= count ? ++_i : --_i) {
        stack = new ImageStack;
        column_space = max_height;
        while (column_space > 0) {
          item = this.shorter_than(column_space);
          if (item) {
            column_space -= item.image_height;
            stack.push(item);
          } else {
            column_space = 0;
          }
        }
        stacks.push(stack);
      }
      return stacks.sort(function() {
        return 0.5 - Math.random();
      });
    };

    return ImageStack;

  })();

  TileView = (function() {

    function TileView(url, parent) {
      var container;
      this.parent = parent;
      container = document.createElement('div');
      jQuery(container).attr("id", "tiles_collection");
      jQuery("#" + this.parent).append(container);
      this.menu_parent = this.parent;
      this.parent = jQuery("#tiles_collection");
      this.generate_menu();
      this.generate(url);
    }

    TileView.prototype.select_menu_item = function(item, listmenu) {
      window.container.parent.html("");
      window.container.generate("http://service.dt.se/ads/ads/dt/" + (jQuery(item).attr("id")) + ".js");
      jQuery(listmenu).children().attr("class", "");
      return jQuery(item).attr("class", "selected");
    };

    TileView.prototype.generate_menu = function() {
      var d, day, days, i, listitem, listmenu, _results;
      d = new Date();
      listmenu = document.createElement('ul');
      jQuery(listmenu).attr("id", "stacker_menu");
      jQuery(this.parent).before(listmenu);
      listitem = document.createElement('li');
      jQuery(listitem).html("Senaste");
      jQuery(listitem).attr("id", "latest_ads");
      jQuery(listitem).attr("class", "selected");
      jQuery(listitem).click(function() {
        return window.container.select_menu_item(this, listmenu);
      });
      jQuery(listmenu).append(listitem);
      days = ["sunday", "monday", "tuesday", "wednesday", "hhursday", "friday", "saturday", "sunday"];
      i = 0;
      _results = [];
      while (i < 6) {
        i++;
        d = new Date();
        d.setDate(d.getDate() - i);
        listitem = document.createElement('li');
        day = d.getDate();
        if (day < 10) {
          day = "0" + day;
        }
        jQuery(listitem).html("" + (d.getFullYear()) + "-" + (d.getMonth() + 1) + "-" + day);
        jQuery(listitem).attr("id", "" + days[d.getDay()]);
        jQuery(listitem).click(function() {
          return window.container.select_menu_item(this, listmenu);
        });
        _results.push(jQuery(listmenu).append(listitem));
      }
      return _results;
    };

    TileView.prototype.get_block = function(column_count, preferred_height) {
      var stacks;
      if ((this.remaining_inventory_space / column_count) < preferred_height) {
        preferred_height += this.remaining_inventory_space / column_count;
      }
      stacks = this.image_inventory.partition(column_count, preferred_height);
      if (stacks) {
        this.remaining_inventory_space = this.image_inventory.total_height();
      }
      return stacks;
    };

    TileView.prototype.render = function() {
      var block, block_container, blocks, column_container, i, image_block, image_stack, img, img_height, item, margin, minimum_height, preferred_height, _i, _j, _k, _len, _len1, _len2, _ref, _results;
      this.remaining_inventory_space = this.image_inventory.total_height();
      preferred_height = 900;
      blocks = [];
      minimum_height = 0;
      while (image_block = this.get_block(3, preferred_height)) {
        minimum_height = Math.round(image_block[0].total_height() + image_block[1].total_height() + image_block[2].total_height()) / 3;
        block_container = document.createElement('div');
        jQuery(block_container).attr("class", "block_container");
        blocks.push(block_container);
        for (_i = 0, _len = image_block.length; _i < _len; _i++) {
          image_stack = image_block[_i];
          img_height = 0;
          column_container = document.createElement('div');
          jQuery(column_container).addClass("image_column");
          jQuery(column_container).addClass("column_" + _i);
          jQuery(column_container).attr("id", "height_" + (Math.round(image_stack.total_height())));
          jQuery(block_container).append(column_container);
          preferred_height = Math.round(minimum_height);
          jQuery(block_container).attr("id", "height_" + preferred_height);
          if (image_stack.list.length === 1) {
            img_height = preferred_height;
          }
          if (image_stack.list.length > 1) {
            margin = Math.round((preferred_height + 7) - image_stack.total_height());
            margin = Math.round(margin / (image_stack.list.length - 1));
          }
          if (margin < 0) {
            margin = 1;
          }
          image_stack.shuffle();
          _ref = image_stack.list;
          for (i = _j = 0, _len1 = _ref.length; _j < _len1; i = ++_j) {
            item = _ref[i];
            img = document.createElement('img');
            jQuery(img).attr("src", "" + item.image);
            jQuery(img).attr("id", "img_" + item.id);
            jQuery(img).attr("alt", item.url);
            jQuery(img).attr("height", "" + item.image_height);
            jQuery(img).click(function() {
              return window.open(jQuery(this).attr("alt"));
            });
            jQuery(img).attr("width", "" + item.image_width);
            if (i < (image_stack.list.length - 1)) {
              jQuery(img).attr("style", "margin-bottom: " + (Math.round(margin)) + "px");
            }
            jQuery(column_container).append(img);
          }
        }
      }
      blocks = blocks.sort(function() {
        return 0.5 - Math.random();
      });
      _results = [];
      for (_k = 0, _len2 = blocks.length; _k < _len2; _k++) {
        block = blocks[_k];
        _results.push(this.parent.append(block));
      }
      return _results;
    };

    TileView.prototype.generate = function(url) {
      jQuery.ajax({
        type: "GET",
        url: url,
        dataType: "script"
      });
    };

    return TileView;

  })();

  jQuery(function() {
    var remote_json;
    remote_json = "http://service.dt.se/ads/ads/dt/latest_ads.js";
    return window.container = new TileView(remote_json, "wrapper");
  });

  return;

  SingleAdView = (function() {

    function SingleAdView(url, parent, linkto) {
      var adslink, infofield;
      this.parent = parent;
      this.linkto = linkto;
      this.parent = jQuery("#" + this.parent);
      infofield = document.createElement('div');
      this.parent.append(infofield);
      jQuery(infofield).attr("id", "ad_info");
      jQuery(infofield).attr("style", "text-align: center; background-color: #CCC; margin-bottom: 2px;");
      adslink = document.createElement('a');
      jQuery(adslink).attr("href", this.linkto);
      jQuery(adslink).attr("target", "_self");
      jQuery(adslink).attr("style", "text-decoration: none; color: #333; font-weight: bold; font-size: 13px;");
      jQuery(adslink).html("Se fler tidningsannonser &raquo;");
      jQuery(infofield).append(adslink);
      console.log(url);
      this.generate(url);
    }

    SingleAdView.prototype.generate = function(url) {
      jQuery.ajax({
        type: "GET",
        url: url,
        dataType: "script",
        timeout: 10000
      });
    };

    SingleAdView.prototype.viewImage = function(item, url) {
      var img;
      img = document.createElement('img');
      item.image = "" + url + item.image;
      item.url = "" + url + item.url;
      jQuery(img).attr("src", "" + item.image);
      jQuery(img).attr("alt", "Klicka p annonsen fr att visa den i ett nytt fnster.");
      jQuery(img).attr("title", "Klicka p annonsen fr att visa den i ett nytt fnster.");
      jQuery(img).attr("longdesc", item.url);
      jQuery(img).attr("style", "width:278px;height:auto;margin-bottom:6px; border: 1px solid #555; cursor: pointer");
      jQuery(img).click(function() {
        return window.open(jQuery(this).attr("longdesc"));
      });
      this.parent.append(img);
    };

    return SingleAdView;

  })();

  jQuery(function() {
    var remote_json;
    remote_json = "http://files.mittmedia.se/print-webb/dt/latest_ads_random.js";
    window.initDisplayAdsRandom = function(url, images) {
      setTimeout(function() {
        return window.single_ad_container.viewImage(images[Math.floor(Math.random() * images.length)], url, 1000);
      });
    };
    window.single_ad_container = new SingleAdView(remote_json, "single_ad_view", "http://www.dt.se/service/annonser");
  });

  window.initDisplayAds = function(url, images) {
    var i, img, _i, _len;
    for (i = _i = 0, _len = images.length; _i < _len; i = ++_i) {
      img = images[i];
      img.id = i;
      img.url = "" + url + img.url;
      img.image = "" + url + img.image;
      window.container.image_inventory.push(img);
    }
    window.container.render();
  };

  ImageStack = (function() {

    function ImageStack(arr) {
      if (arr == null) {
        arr = [];
      }
      this.list = arr;
    }

    ImageStack.prototype.shuffle = function() {
      this.list = this.list.sort(function() {
        return 0.5 - Math.random();
      });
    };

    ImageStack.prototype.list = function() {
      return this.list;
    };

    ImageStack.prototype.push = function(item) {
      return this.list.push(item);
    };

    ImageStack.prototype.add_stack = function(stack) {
      var item, _i, _len, _ref;
      _ref = stack.list;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        this.push(item);
      }
    };

    ImageStack.prototype.empty = function() {
      return this.list.length === 0;
    };

    ImageStack.prototype.tallest = function() {
      var list_by_height;
      list_by_height = this.list.sort(function(a, b) {
        return b.image_height - a.image_height;
      });
      return list_by_height[0];
    };

    ImageStack.prototype.remove_tallest = function() {
      var tallest;
      tallest = this.tallest();
      this.list.splice(this.list.indexOf(tallest), 1);
      return tallest;
    };

    ImageStack.prototype.shorter_than = function(max_height) {
      var item, short_list;
      short_list = this.list.filter(function(obj) {
        return obj.image_height <= max_height;
      });
      if (short_list.length === 0) {
        return false;
      }
      short_list = short_list.sort(function(a, b) {
        return b.image_height - a.image_height;
      });
      item = short_list[0];
      this.list.splice(this.list.indexOf(item), 1);
      return item;
    };

    ImageStack.prototype.total_height = function() {
      var height, item, _i, _len, _ref;
      height = 0;
      _ref = this.list;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        height += item.image_height;
      }
      return height;
    };

    ImageStack.prototype.partition_evenly = function(column_count) {
      var i, stacks, _i;
      stacks = [];
      for (i = _i = 0; 0 <= column_count ? _i < column_count : _i > column_count; i = 0 <= column_count ? ++_i : --_i) {
        stacks[i] = new ImageStack();
      }
      while (!this.empty()) {
        stacks = stacks.sort(function(a, b) {
          return a.total_height() - b.total_height();
        });
        stacks[0].push(this.remove_tallest());
      }
      return stacks;
    };

    ImageStack.prototype.partition = function(count, max_height) {
      var column_space, i, item, stack, stacks, _i;
      if (count == null) {
        count = 3;
      }
      if (max_height == null) {
        max_height = 1000;
      }
      if (this.empty()) {
        return false;
      }
      stacks = [];
      for (i = _i = 0; 0 <= count ? _i < count : _i > count; i = 0 <= count ? ++_i : --_i) {
        stack = new ImageStack;
        column_space = max_height;
        while (column_space > 0) {
          item = this.shorter_than(column_space);
          if (item) {
            column_space -= item.image_height;
            stack.push(item);
          } else {
            column_space = 0;
          }
        }
        stacks.push(stack);
      }
      stacks;

      return stacks.sort(function() {
        return 0.5 - Math.random();
      });
    };

    return ImageStack;

  })();

  TileView = (function() {

    function TileView(url, file, parent) {
      var container;
      this.url = url;
      this.parent = parent;
      this.image_inventory = new ImageStack;
      container = document.createElement('div');
      jQuery(container).attr("id", "tiles_collection");
      jQuery("#" + this.parent).append(container);
      this.menu_parent = this.parent;
      this.parent = jQuery("#tiles_collection");
      this.generate_menu();
      this.generate("" + this.url + file);
    }

    TileView.prototype.select_menu_item = function(item, listmenu) {
      window.container.parent.html("");
      window.container.generate("" + this.url + (jQuery(item).attr("id")) + ".js");
      jQuery(listmenu).children().attr("class", "");
      jQuery(item).attr("class", "selected");
    };

    TileView.prototype.menu_item_hover = function(item, event) {
      if (event === "in") {
        jQuery(item).attr("style", "background-color: #555");
      } else {
        jQuery(item).removeAttr("style");
      }
    };

    TileView.prototype.generate_menu = function() {
      var d, day, days, i, listitem, listmenu, _results;
      listmenu = document.createElement('ul');
      jQuery(listmenu).attr("id", "stacker_menu");
      jQuery(this.parent).before(listmenu);
      listitem = document.createElement('li');
      jQuery(listitem).html("Senaste");
      jQuery(listitem).attr("id", "latest_ads");
      jQuery(listitem).attr("class", "selected");
      jQuery(listitem).click(function() {
        return window.container.select_menu_item(this, listmenu);
      });
      jQuery(listitem).mouseenter(function() {
        return window.container.menu_item_hover(this, "in");
      });
      jQuery(listitem).mouseleave(function() {
        return window.container.menu_item_hover(this, "out");
      });
      jQuery(listmenu).append(listitem);
      days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
      i = 0;
      _results = [];
      while (i < 6) {
        i++;
        d = new Date();
        d.setDate(d.getDate() - i);
        listitem = document.createElement('li');
        day = d.getDate();
        if (day < 10) {
          day = "0" + day;
        }
        jQuery(listitem).html("" + (d.getFullYear()) + "-" + (d.getMonth() + 1) + "-" + day);
        jQuery(listitem).attr("id", "" + days[d.getDay()]);
        jQuery(listitem).click(function() {
          return window.container.select_menu_item(this, listmenu);
        });
        jQuery(listitem).mouseenter(function() {
          return window.container.menu_item_hover(this, "in");
        });
        jQuery(listitem).mouseleave(function() {
          return window.container.menu_item_hover(this, "out");
        });
        _results.push(jQuery(listmenu).append(listitem));
      }
      return _results;
    };

    TileView.prototype.get_block = function(column_count) {
      var default_height, max_height, remaining_inventory_height, stack, stacks, tallest_height, temp_stack, _i, _len;
      if (this.image_inventory.empty()) {
        return false;
      }
      default_height = 950;
      tallest_height = this.image_inventory.tallest().image_height;
      max_height = tallest_height > default_height ? tallest_height : default_height;
      remaining_inventory_height = this.image_inventory.total_height();
      stacks = this.image_inventory.partition(column_count, max_height);
      if (this.image_inventory.empty()) {
        temp_stack = new ImageStack();
        for (_i = 0, _len = stacks.length; _i < _len; _i++) {
          stack = stacks[_i];
          temp_stack.add_stack(stack);
        }
        stacks = temp_stack.partition_evenly(column_count);
      }
      return stacks;
    };

    TileView.prototype.render = function() {
      var block, block_container, blocks, column_container, count, i, image_block, image_stack, img, img_height, item, margin, minimum_height, tallest_stack_height, _i, _j, _k, _len, _len1, _len2, _ref, _results;
      blocks = [];
      count = 0;
      minimum_height = 0;
      while (image_block = this.get_block(3)) {
        block_container = document.createElement('div');
        jQuery(block_container).attr("class", "block_container");
        blocks.push(block_container);
        tallest_stack_height = (image_block.sort(function(a, b) {
          return b.total_height() - a.total_height();
        }))[0].total_height();
        for (_i = 0, _len = image_block.length; _i < _len; _i++) {
          image_stack = image_block[_i];
          img_height = 0;
          column_container = document.createElement('div');
          jQuery(column_container).addClass("image_column");
          jQuery(column_container).addClass("column_" + _i);
          jQuery(block_container).append(column_container);
          margin = 0;
          if (image_stack.list.length > 1) {
            margin += ((tallest_stack_height + 10) - image_stack.total_height()) / (image_stack.list.length - 1);
            margin = Math.round(margin);
          }
          image_stack.shuffle();
          _ref = image_stack.list;
          for (i = _j = 0, _len1 = _ref.length; _j < _len1; i = ++_j) {
            item = _ref[i];
            count++;
            img = document.createElement('img');
            jQuery(img).attr("src", "" + item.image);
            jQuery(img).attr("id", "img_" + item.id);
            jQuery(img).attr("alt", "Klicka p annonsen fr att ppna den i ett nytt fnster");
            jQuery(img).attr("title", "Klicka p annonsen fr att ppna den i ett nytt fnster");
            jQuery(img).attr("longdesc", item.url);
            jQuery(img).attr("height", "" + item.image_height);
            jQuery(img).click(function() {
              return window.open(jQuery(this).attr("longdesc"));
            });
            jQuery(img).attr("width", "" + item.image_width);
            if (i < (image_stack.list.length - 1)) {
              jQuery(img).attr("style", "margin-bottom: " + (Math.round(margin)) + "px");
            }
            jQuery(column_container).append(img);
          }
        }
      }
      blocks = blocks.sort(function() {
        return 0.5 - Math.random();
      });
      _results = [];
      for (_k = 0, _len2 = blocks.length; _k < _len2; _k++) {
        block = blocks[_k];
        _results.push(this.parent.append(block));
      }
      return _results;
    };

    TileView.prototype.generate = function(url) {
      jQuery.ajax({
        type: "GET",
        url: url,
        dataType: "script"
      });
    };

    return TileView;

  })();

  jQuery(function() {
    var remote_json_file, remote_json_url;
    remote_json_url = "http://files.mittmedia.se/print-webb/dt/";
    remote_json_file = "latest_ads.js";
    return window.container = new TileView(remote_json_url, remote_json_file, "AttentionTeaserWrapper");
  });

  return;

}).call(this);
