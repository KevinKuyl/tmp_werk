report({
  "testSuite": "BackstopJS",
  "tests": [
    {
      "pair": {
        "reference": "..\\bitmaps_reference\\custom_test_Custom_Test_0_document_0_desktop.png",
        "test": "..\\bitmaps_test\\20250220-092424\\custom_test_Custom_Test_0_document_0_desktop.png",
        "selector": "document",
        "fileName": "custom_test_Custom_Test_0_document_0_desktop.png",
        "label": "Custom Test",
        "requireSameDimensions": true,
        "misMatchThreshold": 0.1,
        "url": "http://redmijnpc.com",
        "expect": 0,
        "viewportLabel": "desktop",
        "diff": {
          "isSameDimensions": false,
          "dimensionDifference": {
            "width": 0,
            "height": -767
          },
          "rawMisMatchPercentage": 18.803434265242625,
          "misMatchPercentage": "18.80",
          "analysisTime": 742
        },
        "diffImage": "..\\bitmaps_test\\20250220-092424\\failed_diff_custom_test_Custom_Test_0_document_0_desktop.png"
      },
      "status": "fail"
    }
  ],
  "id": "custom_test"
});