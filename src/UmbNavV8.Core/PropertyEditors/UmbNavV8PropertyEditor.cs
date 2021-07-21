﻿using System;
using System.Collections.Generic;
using System.Runtime.CompilerServices;
using Umbraco.Core;
using Umbraco.Core.Logging;
using Umbraco.Core.Models.Editors;
using Umbraco.Core.PropertyEditors;
using Umbraco.Core.Services;
using Umbraco.Web.PropertyEditors;

namespace UmbNavV8.Core.PropertyEditors
{
    [DataEditor(Constants.PropertyEditorAlias, Constants.PackageName, Constants.PackageFilesPath + "views/editor.html",
        ValueType = "JSON", Group = "pickers", Icon = "icon-sitemap")]
    public class UmbNavV8PropertyEditor : DataEditor, IDataEditor
    {
        public UmbNavV8PropertyEditor(ILogger logger)
            : base(logger)
        {
        }

        public override IDataValueEditor GetValueEditor(object configuration)
        {

            var editor = base.GetValueEditor(configuration);

            if (editor is DataValueEditor valueEditor && configuration is UmbNavV8Configuration config)
            {
                valueEditor.HideLabel = config.HideLabel;
            }

            return editor;

        }

        protected override IConfigurationEditor CreateConfigurationEditor() => new UmbNavV8ConfigurationEditor();

        public class UmbNavV8ConfigurationEditor : ConfigurationEditor<UmbNavV8Configuration>
        {
        }
    }
}