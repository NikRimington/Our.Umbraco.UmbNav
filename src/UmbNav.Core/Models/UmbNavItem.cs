﻿using System.Collections.Generic;
using Newtonsoft.Json;
using UmbNav.Core.Enums;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models.PublishedContent;
#if NETCOREAPP

#else
using Umbraco.Core;
using Umbraco.Core.Models.PublishedContent;
#endif

namespace UmbNav.Core.Models
{
    public class UmbNavItem
    {
        [JsonProperty("id")]
        public int Id { get; set; }

        [JsonProperty("udi")]
        public GuidUdi Udi { get; set; }

        [JsonProperty("title")]
        public string Title { get; set; }

        [JsonProperty("target")]
        public string Target { get; set; }

        [JsonProperty("noopener")]
        public string Noopener { get; set; }

        [JsonProperty("noreferrer")]
        public string Noreferrer { get; set; }

        [JsonProperty("anchor")]
        public string Anchor { get; set; }

        [JsonProperty("children")]
        public IEnumerable<UmbNavItem> Children { get; set; }

        [JsonIgnore]
        internal IPublishedContent PublishedContentItem { get; set; }
        
        [JsonIgnore]
        public UmbNavItemType ItemType { get; set; }

        [JsonIgnore]
        public int Level { get; set; }

        [JsonProperty("culture")]
        public string Culture { get; set; }

        [JsonProperty("collapsed")]
        internal bool Collapsed { get; set; }

        [JsonProperty("hideLoggedIn")]
        internal bool HideLoggedIn { get; set; }

        [JsonProperty("hideLoggedOut")]
        internal bool HideLoggedOut { get; set; }

        [JsonProperty("url")]
        internal string Url { get; set; }

        [JsonProperty("includeChildNodes")]
        internal bool IncludeChildNodes { get; set; }
    }
}