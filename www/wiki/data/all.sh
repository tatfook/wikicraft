#!/bin/bash

rm ../../../database/npl/website_template*
rm ../../../database/npl/website_category*

bash website_category.sh
echo 

bash website_template.sh
echo 

bash website_template_style.sh
echo

