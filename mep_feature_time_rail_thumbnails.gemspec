$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "mep_feature_time_rail_thumbnails/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "mep_feature_time_rail_thumbnails"
  s.version     = MepFeatureTimeRailThumbnails::VERSION
  s.authors     = ["Jason Ronallo"]
  s.email       = ["jronallo@gmail.com"]
  s.homepage    = "TODO"
  s.summary     = "MediaElement.js Plugin for Preview Thumbnails"
  s.description = "Add a thumbnail preview to the MediaElement.js player."

  s.files = Dir["{lib,vendor}/**/*", "MIT-LICENSE", "README.md"]

  s.add_dependency "rails", ">= 3.2.17"
end
