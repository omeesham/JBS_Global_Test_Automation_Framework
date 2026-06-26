# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: specs\local-office\local-office-settings.spec.ts >> Local Office Settings — Basic Information @locations @local-office-settings >> TC-LOS-BAS-065: Clear Return offset → save → reload → app re-applies default 1
- Location: specs\local-office\local-office-settings.spec.ts:878:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "1"
Received: ""
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - alert [ref=e2]
  - generic [ref=e4]:
    - generic [ref=e7]:
      - list [ref=e9]:
        - listitem [ref=e10]:
          - button "1604 Parker Palm Springs" [ref=e11] [cursor=pointer]:
            - generic [ref=e13]: "1604"
            - generic [ref=e14]:
              - generic [ref=e15]: Parker Palm Springs
              - img [ref=e16]
      - generic [ref=e22]:
        - list [ref=e24]:
          - listitem [ref=e25]:
            - link "Home" [ref=e26] [cursor=pointer]:
              - /url: /navigator/locations/1604/home
              - img [ref=e27]
              - generic [ref=e30]: Home
          - listitem [ref=e31]:
            - link "Inbox" [ref=e32] [cursor=pointer]:
              - /url: /navigator/locations/1604/inbox
              - img [ref=e33]
              - generic [ref=e36]: Inbox
          - listitem [ref=e37]:
            - button "Actions" [ref=e38] [cursor=pointer]:
              - img [ref=e39]
              - generic [ref=e41]: Actions
              - img [ref=e42]
          - listitem [ref=e44]:
            - button "Commissions" [ref=e45] [cursor=pointer]:
              - img [ref=e46]
              - generic [ref=e48]: Commissions
              - img [ref=e49]
          - listitem [ref=e51]:
            - button "Tax" [ref=e52] [cursor=pointer]:
              - img [ref=e53]
              - generic [ref=e56]: Tax
              - img [ref=e57]
          - listitem [ref=e59]:
            - button "Setup" [ref=e60] [cursor=pointer]:
              - img [ref=e61]
              - generic [ref=e64]: Setup
              - img [ref=e65]
          - listitem [ref=e67]:
            - button "Studio" [ref=e68] [cursor=pointer]:
              - img [ref=e69]
              - generic [ref=e71]: Studio
              - img [ref=e72]
        - generic [ref=e74]:
          - generic [ref=e75]: Search
          - list [ref=e77]:
            - listitem [ref=e78]:
              - button "Order Search" [disabled]:
                - img
                - generic: Order Search
            - listitem [ref=e79]:
              - link "Job Search" [ref=e80] [cursor=pointer]:
                - /url: /navigator/locations/1604/fulfillments
                - img [ref=e81]
                - generic [ref=e84]: Job Search
            - listitem [ref=e85]:
              - link "Asset Search" [ref=e86] [cursor=pointer]:
                - /url: /navigator/locations/1604/assets
                - img [ref=e87]
                - generic [ref=e90]: Asset Search
            - listitem [ref=e91]:
              - link "Customer Search" [ref=e92] [cursor=pointer]:
                - /url: /navigator/locations/1604/customers
                - img [ref=e93]
                - generic [ref=e96]: Customer Search
            - listitem [ref=e97]:
              - button "DRO Search" [disabled]:
                - img
                - generic: DRO Search
            - listitem [ref=e98]:
              - button "Payment Search" [disabled]:
                - img
                - generic: Payment Search
            - listitem [ref=e99]:
              - link "Item Search" [ref=e100] [cursor=pointer]:
                - /url: /navigator/locations/1604/products
                - img [ref=e101]
                - generic [ref=e111]: Item Search
            - listitem [ref=e112]:
              - button "ECT Search" [disabled]:
                - img
                - generic: ECT Search
            - listitem [ref=e113]:
              - button "Event Agendas" [disabled]:
                - img
                - generic: Event Agendas
        - list [ref=e115]:
          - listitem [ref=e116]:
            - button "Navigator Assistant" [ref=e117] [cursor=pointer]:
              - img [ref=e118]
              - generic [ref=e120]: Navigator Assistant
      - list [ref=e123]:
        - listitem [ref=e124]:
          - button "PC prd click auto" [ref=e125] [cursor=pointer]:
            - generic [ref=e127]: PC
            - generic [ref=e129]: prd click auto
            - img [ref=e130]
      - button "Click to restore sidebar" [ref=e134]
    - main [ref=e135]:
      - generic [ref=e138]:
        - generic [ref=e140]:
          - button "trigger-button" [ref=e141] [cursor=pointer]:
            - img
          - generic [ref=e143]:
            - heading "Local Office Settings" [level=1] [ref=e145]
            - button "More information" [ref=e146]:
              - img [ref=e147]
        - generic [ref=e150]:
          - tablist [ref=e151]:
            - tab "Basic Information" [selected] [ref=e152] [cursor=pointer]:
              - generic [ref=e153]:
                - img [ref=e154]
                - text: Basic Information
            - tab "Location Settings History" [ref=e157] [cursor=pointer]:
              - generic [ref=e158]:
                - img [ref=e159]
                - text: Location Settings History
            - tab "ECT Settings" [ref=e163] [cursor=pointer]:
              - generic [ref=e164]:
                - img [ref=e165]
                - text: ECT Settings
          - tabpanel [ref=e168]:
            - generic [ref=e174]:
              - generic [ref=e175]:
                - heading "1604 - Parker Palm Springs" [level=3] [ref=e176]
                - generic [ref=e177]:
                  - button "Save" [disabled]
              - generic [ref=e178]:
                - generic [ref=e179]:
                  - generic [ref=e181]:
                    - generic [ref=e183]: Default Date Offsets
                    - generic [ref=e185]:
                      - generic [ref=e187]:
                        - term [ref=e188]: Prep Date Offset (Relative to Start)
                        - definition [ref=e189]:
                          - generic [ref=e190]:
                            - textbox [ref=e191]: "-1"
                            - generic [ref=e192]: Hrs
                      - generic [ref=e194]:
                        - term [ref=e195]: Return Date Offset (Relative to End)
                        - definition [ref=e196]:
                          - generic [ref=e197]:
                            - textbox [ref=e198]
                            - generic [ref=e199]: Hrs
                      - generic [ref=e201]:
                        - term [ref=e202]: Set Date Offset (Relative to Start)
                        - definition [ref=e203]:
                          - generic [ref=e204]:
                            - textbox [ref=e205]: "-1"
                            - generic [ref=e206]: Hrs
                      - generic [ref=e208]:
                        - term [ref=e209]: Strike Date Offset (Relative to End)
                        - definition [ref=e210]:
                          - generic [ref=e211]:
                            - textbox [ref=e212]: "1"
                            - generic [ref=e213]: Hrs
                      - generic [ref=e215]:
                        - term [ref=e216]: Delivery Date Offset (Relative to Start)
                        - definition [ref=e217]:
                          - generic [ref=e218]:
                            - textbox [ref=e219]: "0"
                            - generic [ref=e220]: Hrs
                      - generic [ref=e222]:
                        - term [ref=e223]: Pickup Date Offset (Relative to End)
                        - definition [ref=e224]:
                          - generic [ref=e225]:
                            - textbox [ref=e226]: "0"
                            - generic [ref=e227]: Hrs
                  - generic [ref=e229]:
                    - generic [ref=e231]: Misc Settings
                    - generic [ref=e233]:
                      - generic [ref=e234]:
                        - term [ref=e235]: Use Fulfillment
                        - definition [ref=e236]:
                          - generic [ref=e238]:
                            - checkbox [ref=e239] [cursor=pointer]
                            - checkbox
                      - generic [ref=e240]:
                        - term [ref=e241]: Use Availability
                        - definition [ref=e242]:
                          - generic [ref=e244]:
                            - checkbox [checked] [ref=e245] [cursor=pointer]:
                              - generic:
                                - img
                            - checkbox [checked]
                      - generic [ref=e246]:
                        - term [ref=e247]: Use Equipments QC
                        - definition [ref=e248]:
                          - generic [ref=e250]:
                            - checkbox [disabled] [ref=e251]
                            - checkbox [disabled]
                      - generic [ref=e252]:
                        - term [ref=e253]: Items Filled from Requests Return to Availability
                        - definition [ref=e254]:
                          - generic [ref=e256]:
                            - checkbox [ref=e257] [cursor=pointer]
                            - checkbox
                      - generic [ref=e258]:
                        - term [ref=e259]: Allow tentative and confirmed Status to have the same priority
                        - definition [ref=e260]:
                          - generic [ref=e262]:
                            - checkbox [ref=e263] [cursor=pointer]
                            - checkbox
                      - generic [ref=e264]:
                        - term [ref=e265]: Print Description (Default)
                        - definition [ref=e266]:
                          - generic [ref=e268]:
                            - checkbox [checked] [ref=e269] [cursor=pointer]:
                              - generic:
                                - img
                            - checkbox [checked]
                      - generic [ref=e270]:
                        - term [ref=e271]: Use ServiceType for Subrental Inventory Sources
                        - definition [ref=e272]:
                          - generic [ref=e274]:
                            - checkbox [checked] [ref=e275] [cursor=pointer]:
                              - generic:
                                - img
                            - checkbox [checked]
                      - generic [ref=e276]:
                        - term [ref=e277]: Phone 1
                        - definition [ref=e278]:
                          - textbox [ref=e282]: 760-883-1957
                      - generic [ref=e283]:
                        - term [ref=e284]: Phone 2
                        - definition [ref=e285]:
                          - textbox [ref=e289]
                      - generic [ref=e290]:
                        - term [ref=e291]: Default new job to 1 day
                        - definition [ref=e292]:
                          - generic [ref=e294]:
                            - generic [ref=e296]:
                              - checkbox [ref=e297] [cursor=pointer]
                              - checkbox
                              - generic [ref=e298]: Event
                            - generic [ref=e300]:
                              - checkbox [ref=e301] [cursor=pointer]
                              - checkbox
                              - generic [ref=e302]: Outside
                            - generic [ref=e304]:
                              - checkbox [ref=e305] [cursor=pointer]
                              - checkbox
                              - generic [ref=e306]: Internal
                      - generic [ref=e307]:
                        - term [ref=e308]: Default Labor to Hourly
                        - definition [ref=e309]:
                          - generic [ref=e311]:
                            - checkbox [ref=e312] [cursor=pointer]
                            - checkbox
                      - generic [ref=e313]:
                        - term [ref=e314]: Default Order Type
                        - definition [ref=e315]:
                          - generic [ref=e317]:
                            - combobox [ref=e318] [cursor=pointer]:
                              - img
                            - combobox [ref=e319]
                      - generic [ref=e320]:
                        - term [ref=e321]: PO Number
                        - definition [ref=e322]:
                          - textbox [ref=e325]
                      - generic [ref=e326]:
                        - term [ref=e327]: PO Number Label
                        - definition [ref=e328]:
                          - textbox [ref=e331]
                - generic [ref=e332]:
                  - generic [ref=e334]:
                    - generic [ref=e336]: Section
                    - generic [ref=e337]:
                      - generic [ref=e338]:
                        - generic [ref=e339]:
                          - term [ref=e340]: Use Section
                          - definition [ref=e341]:
                            - generic [ref=e343]:
                              - checkbox [checked] [ref=e344] [cursor=pointer]:
                                - generic:
                                  - img
                              - checkbox [checked]
                        - button "Default" [ref=e345] [cursor=pointer]
                      - region "local settings table" [ref=e347]:
                        - table [ref=e348]:
                          - rowgroup [ref=e349]:
                            - row "Section Name Active" [ref=e350]:
                              - columnheader "Section Name" [ref=e351]
                              - columnheader "Active" [ref=e352]
                          - rowgroup [ref=e353]:
                            - row "AV Services toggle" [ref=e354]:
                              - cell "AV Services" [ref=e355]:
                                - textbox "edit name 7bef1606-bcf6-4822-bf54-4b3d8ae7ede2" [ref=e356]: AV Services
                              - cell "toggle" [ref=e357] [cursor=pointer]:
                                - img [ref=e358]
                            - row "Flipcharts toggle" [ref=e360]:
                              - cell "Flipcharts" [ref=e361]:
                                - textbox "edit name caf77d58-276a-4eed-94ff-51eaf993b4a2" [ref=e362]: Flipcharts
                              - cell "toggle" [ref=e363] [cursor=pointer]
                            - row "Hybrid Meeting toggle" [ref=e364]:
                              - cell "Hybrid Meeting" [ref=e365]:
                                - textbox "edit name 63f43037-9936-46b4-9473-033eab4323e1" [ref=e366]: Hybrid Meeting
                              - cell "toggle" [ref=e367] [cursor=pointer]:
                                - img [ref=e368]
                            - row "Labor toggle" [ref=e370]:
                              - cell "Labor" [ref=e371]:
                                - textbox "edit name 684a35d9-3eeb-470e-85dc-9522df51cdba" [ref=e372]: Labor
                              - cell "toggle" [ref=e373] [cursor=pointer]:
                                - img [ref=e374]
                            - row "Lighting toggle" [ref=e376]:
                              - cell "Lighting" [ref=e377]:
                                - textbox "edit name a0d6c771-1979-4ba7-b1e2-aaf2bad653dd" [ref=e378]: Lighting
                              - cell "toggle" [ref=e379] [cursor=pointer]:
                                - img [ref=e380]
                            - row "Power toggle" [ref=e382]:
                              - cell "Power" [ref=e383]:
                                - textbox "edit name 630e7b13-6dfb-4702-a1e4-e959f3897493" [ref=e384]: Power
                              - cell "toggle" [ref=e385] [cursor=pointer]:
                                - img [ref=e386]
                            - row "Presenter Support toggle" [ref=e388]:
                              - cell "Presenter Support" [ref=e389]:
                                - textbox "edit name 747111e1-8ba9-4b7b-8e0f-82ac8f3bea88" [ref=e390]: Presenter Support
                              - cell "toggle" [ref=e391] [cursor=pointer]:
                                - img [ref=e392]
                            - row "Projection toggle" [ref=e394]:
                              - cell "Projection" [ref=e395]:
                                - textbox "edit name 145a570e-843a-41f7-bacb-411a63dd762a" [ref=e396]: Projection
                              - cell "toggle" [ref=e397] [cursor=pointer]:
                                - img [ref=e398]
                            - row "Rigging toggle" [ref=e400]:
                              - cell "Rigging" [ref=e401]:
                                - textbox "edit name 5d46f6a5-ddc2-41e0-957b-5738449d4da0" [ref=e402]: Rigging
                              - cell "toggle" [ref=e403] [cursor=pointer]:
                                - img [ref=e404]
                            - row "Scenic toggle" [ref=e406]:
                              - cell "Scenic" [ref=e407]:
                                - textbox "edit name 422d7e54-42ce-43b1-aedc-2a3c6700f742" [ref=e408]: Scenic
                              - cell "toggle" [ref=e409] [cursor=pointer]:
                                - img [ref=e410]
                            - row "Staging toggle" [ref=e412]:
                              - cell "Staging" [ref=e413]:
                                - textbox "edit name eb0ceabb-5d23-4508-9f17-572121cef46c" [ref=e414]: Staging
                              - cell "toggle" [ref=e415] [cursor=pointer]:
                                - img [ref=e416]
                            - row "Test Section toggle" [ref=e418]:
                              - cell "Test Section" [ref=e419]:
                                - textbox "edit name b8d4b611-b612-45f4-873a-93cb17e01316" [ref=e420]: Test Section
                              - cell "toggle" [ref=e421] [cursor=pointer]:
                                - img [ref=e422]
                            - row "Video toggle" [ref=e424]:
                              - cell "Video" [ref=e425]:
                                - textbox "edit name ff5b4e38-4195-4318-a4ce-437b04554fe7" [ref=e426]: Video
                              - cell "toggle" [ref=e427] [cursor=pointer]:
                                - img [ref=e428]
                            - row "Whiteboard toggle" [ref=e430]:
                              - cell "Whiteboard" [ref=e431]:
                                - textbox "edit name 51bce9a1-e0f7-42b3-a1fb-3038bff8dfc8" [ref=e432]: Whiteboard
                              - cell "toggle" [ref=e433] [cursor=pointer]:
                                - img [ref=e434]
                            - row "add new row" [ref=e436]:
                              - cell [ref=e437]:
                                - textbox "new row name" [ref=e438]:
                                  - /placeholder: Add New...
                              - cell [ref=e439]
                  - generic [ref=e441]:
                    - generic [ref=e443]: Room Configuration
                    - region "local settings table" [ref=e446]:
                      - table [ref=e447]:
                        - rowgroup [ref=e448]:
                          - row "Room Configuration Name Active" [ref=e449]:
                            - columnheader "Room Configuration Name" [ref=e450]
                            - columnheader "Active" [ref=e451]
                        - rowgroup [ref=e452]:
                          - row "Ballroom A toggle" [ref=e453]:
                            - cell "Ballroom A" [ref=e454]:
                              - textbox "edit name 1" [ref=e455]: Ballroom A
                            - cell "toggle" [ref=e456] [cursor=pointer]:
                              - img [ref=e457]
                          - row "Room Edit Test toggle" [ref=e459]:
                            - cell "Room Edit Test" [ref=e460]:
                              - textbox "edit name 3" [ref=e461]: Room Edit Test
                            - cell "toggle" [ref=e462] [cursor=pointer]:
                              - img [ref=e463]
                          - row "Room Toggle Test toggle" [ref=e465]:
                            - cell "Room Toggle Test" [ref=e466]:
                              - textbox "edit name 2" [ref=e467]: Room Toggle Test
                            - cell "toggle" [ref=e468] [cursor=pointer]:
                              - img [ref=e469]
                          - row "Test Room toggle" [ref=e471]:
                            - cell "Test Room" [ref=e472]:
                              - textbox "edit name 9" [ref=e473]: Test Room
                            - cell "toggle" [ref=e474] [cursor=pointer]:
                              - img [ref=e475]
                          - row "add new row" [ref=e477]:
                            - cell [ref=e478]:
                              - textbox "new row name" [ref=e479]:
                                - /placeholder: Add New...
                            - cell [ref=e480]
                  - generic [ref=e482]:
                    - generic [ref=e484]: Default Logo
                    - generic [ref=e485]:
                      - generic [ref=e487]:
                        - generic [ref=e488]:
                          - generic [ref=e489]: Quotes
                          - generic [ref=e490]:
                            - checkbox [checked] [ref=e491] [cursor=pointer]:
                              - generic:
                                - img
                            - checkbox [checked]
                        - generic [ref=e492]:
                          - generic [ref=e493]: Rental Orders/DROs
                          - generic [ref=e494]:
                            - checkbox [checked] [ref=e495] [cursor=pointer]:
                              - generic:
                                - img
                            - checkbox [checked]
                      - generic [ref=e497]:
                        - term [ref=e498]: Company Logo
                        - definition [ref=e499]
                - generic [ref=e506]:
                  - generic [ref=e508]: Discount Exemptions
                  - region "local settings table" [ref=e511]:
                    - table [ref=e512]:
                      - rowgroup [ref=e513]:
                        - row "Service Type Exempt" [ref=e514]:
                          - columnheader "Service Type" [ref=e515]
                          - columnheader "Exempt" [ref=e516]
                      - rowgroup [ref=e517]:
                        - row "APP Downloaded toggle" [ref=e518]:
                          - cell "APP Downloaded" [ref=e519]
                          - cell "toggle" [ref=e520] [cursor=pointer]:
                            - img [ref=e521]
                        - row "App Quality Assurance toggle" [ref=e523]:
                          - cell "App Quality Assurance" [ref=e524]
                          - cell "toggle" [ref=e525] [cursor=pointer]:
                            - img [ref=e526]
                        - row "App Quality Assurance – M toggle" [ref=e528]:
                          - cell "App Quality Assurance – M" [ref=e529]
                          - cell "toggle" [ref=e530] [cursor=pointer]:
                            - img [ref=e531]
                        - row "App Remote Access toggle" [ref=e533]:
                          - cell "App Remote Access" [ref=e534]
                          - cell "toggle" [ref=e535] [cursor=pointer]:
                            - img [ref=e536]
                        - row "Application Development toggle" [ref=e538]:
                          - cell "Application Development" [ref=e539]
                          - cell "toggle" [ref=e540] [cursor=pointer]:
                            - img [ref=e541]
                        - row "Application Development – M toggle" [ref=e543]:
                          - cell "Application Development – M" [ref=e544]
                          - cell "toggle" [ref=e545] [cursor=pointer]
                        - row "Application Programming toggle" [ref=e546]:
                          - cell "Application Programming" [ref=e547]
                          - cell "toggle" [ref=e548] [cursor=pointer]
                        - row "Application Programming – M toggle" [ref=e549]:
                          - cell "Application Programming – M" [ref=e550]
                          - cell "toggle" [ref=e551] [cursor=pointer]
                        - row "Audio Conferencing toggle" [ref=e552]:
                          - cell "Audio Conferencing" [ref=e553]
                          - cell "toggle" [ref=e554] [cursor=pointer]
                        - row "Cancellation Fee toggle" [ref=e555]:
                          - cell "Cancellation Fee" [ref=e556]
                          - cell "toggle" [ref=e557] [cursor=pointer]
                        - row "Concise Equipment toggle" [ref=e558]:
                          - cell "Concise Equipment" [ref=e559]
                          - cell "toggle" [ref=e560] [cursor=pointer]
                        - row "Concise Labor - M toggle" [ref=e561]:
                          - cell "Concise Labor - M" [ref=e562]
                          - cell "toggle" [ref=e563] [cursor=pointer]
                        - row "Concise Support Labor toggle" [ref=e564]:
                          - cell "Concise Support Labor" [ref=e565]
                          - cell "toggle" [ref=e566] [cursor=pointer]
                        - row "Creative Content toggle" [ref=e567]:
                          - cell "Creative Content" [ref=e568]
                          - cell "toggle" [ref=e569] [cursor=pointer]
                        - row "Creative Services toggle" [ref=e570]:
                          - cell "Creative Services" [ref=e571]
                          - cell "toggle" [ref=e572] [cursor=pointer]
                        - row "Digital Services toggle" [ref=e573]:
                          - cell "Digital Services" [ref=e574]
                          - cell "toggle" [ref=e575] [cursor=pointer]
                        - row "Digital Services Equipment toggle" [ref=e576]:
                          - cell "Digital Services Equipment" [ref=e577]
                          - cell "toggle" [ref=e578] [cursor=pointer]
                        - row "Digital Services Labor toggle" [ref=e579]:
                          - cell "Digital Services Labor" [ref=e580]
                          - cell "toggle" [ref=e581] [cursor=pointer]
                        - row "Digital Services Subrental toggle" [ref=e582]:
                          - cell "Digital Services Subrental" [ref=e583]
                          - cell "toggle" [ref=e584] [cursor=pointer]
                        - row "Equipment Rental toggle" [ref=e585]:
                          - cell "Equipment Rental" [ref=e586]
                          - cell "toggle" [ref=e587] [cursor=pointer]
                        - row "Event Technology Support toggle" [ref=e588]:
                          - cell "Event Technology Support" [ref=e589]
                          - cell "toggle" [ref=e590] [cursor=pointer]
                        - row "Extended Venue Access Managed Services toggle" [ref=e591]:
                          - cell "Extended Venue Access Managed Services" [ref=e592]
                          - cell "toggle" [ref=e593] [cursor=pointer]
                        - row "Freight toggle" [ref=e594]:
                          - cell "Freight" [ref=e595]
                          - cell "toggle" [ref=e596] [cursor=pointer]
                        - row "HSIA - Equipment toggle" [ref=e597]:
                          - cell "HSIA - Equipment" [ref=e598]
                          - cell "toggle" [ref=e599] [cursor=pointer]
                        - row "HSIA - Labor toggle" [ref=e600]:
                          - cell "HSIA - Labor" [ref=e601]
                          - cell "toggle" [ref=e602] [cursor=pointer]:
                            - img [ref=e603]
                        - row "HSIA - Subrental Equipment toggle" [ref=e605]:
                          - cell "HSIA - Subrental Equipment" [ref=e606]
                          - cell "toggle" [ref=e607] [cursor=pointer]:
                            - img [ref=e608]
                        - row "HSIA - Wi-Fi Services toggle" [ref=e610]:
                          - cell "HSIA - Wi-Fi Services" [ref=e611]
                          - cell "toggle" [ref=e612] [cursor=pointer]
                        - row "HSIA Services toggle" [ref=e613]:
                          - cell "HSIA Services" [ref=e614]
                          - cell "toggle" [ref=e615] [cursor=pointer]
                        - row "Lighting toggle" [ref=e616]:
                          - cell "Lighting" [ref=e617]
                          - cell "toggle" [ref=e618] [cursor=pointer]
                        - row "Lighting Subrental toggle" [ref=e619]:
                          - cell "Lighting Subrental" [ref=e620]
                          - cell "toggle" [ref=e621] [cursor=pointer]
                        - row "Loss Damage Waiver toggle" [ref=e622]:
                          - cell "Loss Damage Waiver" [ref=e623]
                          - cell "toggle" [ref=e624] [cursor=pointer]:
                            - img [ref=e625]
                        - row "Mobile Apps toggle" [ref=e627]:
                          - cell "Mobile Apps" [ref=e628]
                          - cell "toggle" [ref=e629] [cursor=pointer]
                        - row "Music Access toggle" [ref=e630]:
                          - cell "Music Access" [ref=e631]
                          - cell "toggle" [ref=e632] [cursor=pointer]
                        - row "Operator Labor toggle" [ref=e633]:
                          - cell "Operator Labor" [ref=e634]
                          - cell "toggle" [ref=e635] [cursor=pointer]:
                            - img [ref=e636]
                        - row "Photographic Services toggle" [ref=e638]:
                          - cell "Photographic Services" [ref=e639]
                          - cell "toggle" [ref=e640] [cursor=pointer]
                        - row "Power Infrastructure toggle" [ref=e641]:
                          - cell "Power Infrastructure" [ref=e642]
                          - cell "toggle" [ref=e643] [cursor=pointer]
                        - row "Power Labor toggle" [ref=e644]:
                          - cell "Power Labor" [ref=e645]
                          - cell "toggle" [ref=e646] [cursor=pointer]
                        - row "Power Rental Equipment toggle" [ref=e647]:
                          - cell "Power Rental Equipment" [ref=e648]
                          - cell "toggle" [ref=e649] [cursor=pointer]
                        - row "Power Sub-rental Equipment toggle" [ref=e650]:
                          - cell "Power Sub-rental Equipment" [ref=e651]
                          - cell "toggle" [ref=e652] [cursor=pointer]
                        - row "Production Labor toggle" [ref=e653]:
                          - cell "Production Labor" [ref=e654]
                          - cell "toggle" [ref=e655] [cursor=pointer]
                        - row "Production Management toggle" [ref=e656]:
                          - cell "Production Management" [ref=e657]
                          - cell "toggle" [ref=e658] [cursor=pointer]
                        - row "Reimbursed Expense toggle" [ref=e659]:
                          - cell "Reimbursed Expense" [ref=e660]
                          - cell "toggle" [ref=e661] [cursor=pointer]
                        - row "Rigging Equipment - Subrental toggle" [ref=e662]:
                          - cell "Rigging Equipment - Subrental" [ref=e663]
                          - cell "toggle" [ref=e664] [cursor=pointer]
                        - row "Rigging Equipment Rental toggle" [ref=e665]:
                          - cell "Rigging Equipment Rental" [ref=e666]
                          - cell "toggle" [ref=e667] [cursor=pointer]
                        - row "Rigging Labor toggle" [ref=e668]:
                          - cell "Rigging Labor" [ref=e669]
                          - cell "toggle" [ref=e670] [cursor=pointer]
                        - row "Rigging Labor - External toggle" [ref=e671]:
                          - cell "Rigging Labor - External" [ref=e672]
                          - cell "toggle" [ref=e673] [cursor=pointer]
                        - row "Sales & Consumables toggle" [ref=e674]:
                          - cell "Sales & Consumables" [ref=e675]
                          - cell "toggle" [ref=e676] [cursor=pointer]
                        - row "Scenic Equipment Rental toggle" [ref=e677]:
                          - cell "Scenic Equipment Rental" [ref=e678]
                          - cell "toggle" [ref=e679] [cursor=pointer]
                        - row "Scenic Sub-Rental toggle" [ref=e680]:
                          - cell "Scenic Sub-Rental" [ref=e681]
                          - cell "toggle" [ref=e682] [cursor=pointer]
                        - row "Service Charge toggle" [ref=e683]:
                          - cell "Service Charge" [ref=e684]
                          - cell "toggle" [ref=e685] [cursor=pointer]
                        - row "Setup Charges toggle" [ref=e686]:
                          - cell "Setup Charges" [ref=e687]
                          - cell "toggle" [ref=e688] [cursor=pointer]
                        - row "Shipping Resale toggle" [ref=e689]:
                          - cell "Shipping Resale" [ref=e690]
                          - cell "toggle" [ref=e691] [cursor=pointer]
                        - row "Sub-Contracted Labor toggle" [ref=e692]:
                          - cell "Sub-Contracted Labor" [ref=e693]
                          - cell "toggle" [ref=e694] [cursor=pointer]
                        - row "Sub-Rental Equipment toggle" [ref=e695]:
                          - cell "Sub-Rental Equipment" [ref=e696]
                          - cell "toggle" [ref=e697] [cursor=pointer]
                        - row "Technical Design & Engineering toggle" [ref=e698]:
                          - cell "Technical Design & Engineering" [ref=e699]
                          - cell "toggle" [ref=e700] [cursor=pointer]
                        - row "Technician - Support Services toggle" [ref=e701]:
                          - cell "Technician - Support Services" [ref=e702]
                          - cell "toggle" [ref=e703] [cursor=pointer]
                        - row "Telecom Equipment toggle" [ref=e704]:
                          - cell "Telecom Equipment" [ref=e705]
                          - cell "toggle" [ref=e706] [cursor=pointer]
                        - row "Telecom Labor toggle" [ref=e707]:
                          - cell "Telecom Labor" [ref=e708]
                          - cell "toggle" [ref=e709] [cursor=pointer]
                        - row "Telecom Services toggle" [ref=e710]:
                          - cell "Telecom Services" [ref=e711]
                          - cell "toggle" [ref=e712] [cursor=pointer]
                        - row "Telecom Subrental toggle" [ref=e713]:
                          - cell "Telecom Subrental" [ref=e714]
                          - cell "toggle" [ref=e715] [cursor=pointer]
                        - row "TRA/AVT Royalty/Redevance toggle" [ref=e716]:
                          - cell "TRA/AVT Royalty/Redevance" [ref=e717]
                          - cell "toggle" [ref=e718] [cursor=pointer]
                        - row "Venue Equipment Rental toggle" [ref=e719]:
                          - cell "Venue Equipment Rental" [ref=e720]
                          - cell "toggle" [ref=e721] [cursor=pointer]
                        - row "Video Conferencing toggle" [ref=e722]:
                          - cell "Video Conferencing" [ref=e723]
                          - cell "toggle" [ref=e724] [cursor=pointer]
                        - row "Virtual Events Equipment toggle" [ref=e725]:
                          - cell "Virtual Events Equipment" [ref=e726]
                          - cell "toggle" [ref=e727] [cursor=pointer]
                        - row "Virtual Events Professional Service toggle" [ref=e728]:
                          - cell "Virtual Events Professional Service" [ref=e729]
                          - cell "toggle" [ref=e730] [cursor=pointer]
                        - row "Virtual Events Support Labor toggle" [ref=e731]:
                          - cell "Virtual Events Support Labor" [ref=e732]
                          - cell "toggle" [ref=e733] [cursor=pointer]
                        - row "Web Conferencing toggle" [ref=e734]:
                          - cell "Web Conferencing" [ref=e735]
                          - cell "toggle" [ref=e736] [cursor=pointer]
                        - row "Wedding Event Equipment Rental toggle" [ref=e737]:
                          - cell "Wedding Event Equipment Rental" [ref=e738]
                          - cell "toggle" [ref=e739] [cursor=pointer]
                        - row "Wedding Event Labor toggle" [ref=e740]:
                          - cell "Wedding Event Labor" [ref=e741]
                          - cell "toggle" [ref=e742] [cursor=pointer]
                        - row "Wedding Event Sales & Consumables toggle" [ref=e743]:
                          - cell "Wedding Event Sales & Consumables" [ref=e744]
                          - cell "toggle" [ref=e745] [cursor=pointer]
                        - row "xAdministrative Fee toggle" [ref=e746]:
                          - cell "xAdministrative Fee" [ref=e747]
                          - cell "toggle" [ref=e748] [cursor=pointer]
                        - row "xHSIA Reimbursed Expense toggle" [ref=e749]:
                          - cell "xHSIA Reimbursed Expense" [ref=e750]
                          - cell "toggle" [ref=e751] [cursor=pointer]
                        - row "xMiscellaneous Services toggle" [ref=e752]:
                          - cell "xMiscellaneous Services" [ref=e753]
                          - cell "toggle" [ref=e754] [cursor=pointer]
                        - row "ZSub Contractor Specialty Labor toggle" [ref=e755]:
                          - cell "ZSub Contractor Specialty Labor" [ref=e756]
                          - cell "toggle" [ref=e757] [cursor=pointer]
                        - row "ZSub Rental Specialty toggle" [ref=e758]:
                          - cell "ZSub Rental Specialty" [ref=e759]
                          - cell "toggle" [ref=e760] [cursor=pointer]
                        - row "add new row" [ref=e761]:
                          - cell [ref=e762]
                          - cell [ref=e763]
  - region "Notifications alt+T"
```

# Test source

```ts
  789 |       await localOfficeSettingsPage.toggleRoomActive(idx);
  790 |       await localOfficeSettingsPage.waitForSaveToEnable();
  791 |       await localOfficeSettingsPage.clickSaveAndConfirm();
  792 |       await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  793 |     }
  794 |  // Toggle to inactive
  795 |     const idx2 = (await localOfficeSettingsPage.getRoomNames()).indexOf(roomName);
  796 |     await localOfficeSettingsPage.toggleRoomActive(idx2);
  797 |     expect(await localOfficeSettingsPage.isRoomActive(idx2)).toBe(false);
  798 |     await localOfficeSettingsPage.waitForSaveToEnable();
  799 |     await localOfficeSettingsPage.clickSaveAndConfirm();
  800 |     await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  801 |  // Verify inactive persists after reload
  802 |     const reloadedNames = await localOfficeSettingsPage.getRoomNames();
  803 |     const reloadedIdx = reloadedNames.indexOf(roomName);
  804 |     expect(reloadedIdx, `Room "${roomName}" must persist after save`).toBeGreaterThanOrEqual(0);
  805 |     expect(await localOfficeSettingsPage.isRoomActive(reloadedIdx)).toBe(false);
  806 |  // Cleanup: toggle back to active
  807 |     await localOfficeSettingsPage.toggleRoomActive(reloadedIdx);
  808 |     await localOfficeSettingsPage.waitForSaveToEnable();
  809 |     await localOfficeSettingsPage.clickSaveAndConfirm();
  810 |   });
  811 | 
  812 |   test('TC-LOS-BAS-049: Room edit name round-trip — rename → save → reload → verify', async ({ localOfficeSettingsPage, dependencyGate }) => {
  813 |     dependencyGate(['TC-LOS-BAS-001']);
  814 |  // Full round-trip: rename room, save, reload, verify new name persists.
  815 |     test.setTimeout(90_000);
  816 |     await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  817 |     const roomName = 'Room Edit Test';
  818 |     const renamedName = 'Room Edit Renamed';
  819 |  // Ensure room exists under original name (or renamed from prior run)
  820 |     let names = await localOfficeSettingsPage.getRoomNames();
  821 |     let idx = names.indexOf(roomName);
  822 |     if (idx === -1) {
  823 |  // Check if already renamed from a prior run
  824 |       idx = names.indexOf(renamedName);
  825 |       if (idx >= 0) {
  826 |         await localOfficeSettingsPage.editRoomName(idx, roomName);
  827 |         await localOfficeSettingsPage.waitForSaveToEnable();
  828 |         await localOfficeSettingsPage.clickSaveAndConfirm();
  829 |         await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  830 |       } else {
  831 |  // Neither name found — add fresh
  832 |         await localOfficeSettingsPage.addRoom(roomName);
  833 |         await localOfficeSettingsPage.waitForSaveToEnable();
  834 |         await localOfficeSettingsPage.clickSaveAndConfirm();
  835 |         await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  836 |       }
  837 |       names = await localOfficeSettingsPage.getRoomNames();
  838 |       idx = names.indexOf(roomName);
  839 |     }
  840 |     expect(idx, `Room "${roomName}" must exist`).toBeGreaterThanOrEqual(0);
  841 |  // Rename
  842 |     await localOfficeSettingsPage.editRoomName(idx, renamedName);
  843 |     await localOfficeSettingsPage.waitForSaveToEnable();
  844 |     await localOfficeSettingsPage.clickSaveAndConfirm();
  845 |     await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  846 |  // Verify rename persists
  847 |     const namesAfter = await localOfficeSettingsPage.getRoomNames();
  848 |     expect(namesAfter).toContain(renamedName);
  849 |     expect(namesAfter).not.toContain(roomName);
  850 |  // Cleanup: rename back to original
  851 |     const renamedIdx = namesAfter.indexOf(renamedName);
  852 |     await localOfficeSettingsPage.editRoomName(renamedIdx, roomName);
  853 |     await localOfficeSettingsPage.waitForSaveToEnable();
  854 |     await localOfficeSettingsPage.clickSaveAndConfirm();
  855 |   });
  856 | 
  857 |  // ─────────────────────────────────────────────────────────────────────────
  858 |  // SP-03: Null Offset Testing
  859 |  // ─────────────────────────────────────────────────────────────────────────
  860 | 
  861 |   test('TC-LOS-BAS-064: Clear Prep offset → save → reload → verify empty (not "0")', async ({ localOfficeSettingsPage, dependencyGate }) => {
  862 |     dependencyGate(['TC-LOS-BAS-001']);
  863 |  // verified: null offsets preserved as empty string, not "0".
  864 |     test.setTimeout(60_000);
  865 |     await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  866 |     await localOfficeSettingsPage.clearAndTab('txtPrepDateOffset');
  867 |     await localOfficeSettingsPage.waitForSaveToEnable();
  868 |     await localOfficeSettingsPage.clickSaveAndConfirm();
  869 |     await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  870 |     const value = await localOfficeSettingsPage.getInputValue('txtPrepDateOffset');
  871 |     expect(value).toBe('');
  872 |  // Cleanup: restore original value
  873 |     await localOfficeSettingsPage.fillAndTab('txtPrepDateOffset', '-1');
  874 |     await localOfficeSettingsPage.waitForSaveToEnable();
  875 |     await localOfficeSettingsPage.clickSaveAndConfirm();
  876 |   });
  877 | 
  878 |   test('TC-LOS-BAS-065: Clear Return offset → save → reload → app re-applies default 1', async ({ localOfficeSettingsPage, dependencyGate }) => {
  879 |     dependencyGate(['TC-LOS-BAS-001']);
  880 |     test.setTimeout(60_000);
  881 |     // Live-verified 2026-05-08: clearing Return Date Offset and saving causes the
  882 |     // app to coerce empty back to its default '1' on reload (not stored as empty).
  883 |     // See reports/live-verification-2026-05-08.md.
  884 |     await localOfficeSettingsPage.clearAndTab('txtReturnDateOffset');
  885 |     await localOfficeSettingsPage.waitForSaveToEnable();
  886 |     await localOfficeSettingsPage.clickSaveAndConfirm();
  887 |     await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  888 |     const value = await localOfficeSettingsPage.getInputValue('txtReturnDateOffset');
> 889 |     expect(value).toBe('1');
      |                   ^ Error: expect(received).toBe(expected) // Object.is equality
  890 |     // No additional cleanup needed — app already restored '1'.
  891 |   });
  892 | 
  893 |   test('TC-LOS-BAS-066: Clear Prep but keep Delivery → no cross-validation error', async ({ localOfficeSettingsPage, dependencyGate }) => {
  894 |     dependencyGate(['TC-LOS-BAS-001']);
  895 |  // When Prep is empty, NM-1264 (Delivery >= Prep) should NOT fire because Prep is null.
  896 |     await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  897 |  // Clear Prep (default -1) but leave Delivery at default (0)
  898 |     await localOfficeSettingsPage.clearAndTab('txtPrepDateOffset');
  899 |  // Delivery should NOT be marked invalid (NM-1264 skipped when Prep is null)
  900 |     await expect.poll(
  901 |       () => localOfficeSettingsPage.isFieldInvalid('txtDeliveryDateOffset'),
  902 |       { timeout: 3_000, message: 'Delivery should not be invalid when Prep is cleared' },
  903 |     ).toBe(false);
  904 |  // Save should be enabled (Prep was changed)
  905 |     await expect.poll(() => localOfficeSettingsPage.isSaveEnabled(), { timeout: 5_000 }).toBe(true);
  906 |  // Cleanup: reload to discard
  907 |     await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  908 |   });
  909 | 
  910 |   test('TC-LOS-BAS-067: Clear all 6 offsets → save → reload → all empty', async ({ localOfficeSettingsPage, dependencyGate }) => {
  911 |     dependencyGate(['TC-LOS-BAS-001']);
  912 |  // bulk null round-trip: clear all offsets, save, verify all empty after reload.
  913 |     test.setTimeout(90_000);
  914 |     await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  915 |     for (const { key } of NULL_OFFSET_FIELDS) {
  916 |       await localOfficeSettingsPage.clearAndTab(key);
  917 |     }
  918 |     await localOfficeSettingsPage.waitForSaveToEnable();
  919 |     await localOfficeSettingsPage.clickSaveAndConfirm();
  920 |     await localOfficeSettingsPage.reloadBasicInfo(OFFICE_NO);
  921 |     for (const { key, label } of NULL_OFFSET_FIELDS) {
  922 |       const value = await localOfficeSettingsPage.getInputValue(key);
  923 |       expect(value, `${label} should be empty after clearing`).toBe('');
  924 |     }
  925 |  // Cleanup: restore all defaults
  926 |     for (const { key, defaultValue } of NULL_OFFSET_FIELDS) {
  927 |       await localOfficeSettingsPage.fillAndTab(key, defaultValue);
  928 |     }
  929 |     await localOfficeSettingsPage.waitForSaveToEnable();
  930 |     await localOfficeSettingsPage.clickSaveAndConfirm();
  931 |   });
  932 | 
  933 |  // ─────────────────────────────────────────────────────────────────────────
  934 |  // BLOCKED / NOT-AUTOMATABLE / DEFERRED TCs
  935 |  // (documented for traceability — not implemented)
  936 |  // ─────────────────────────────────────────────────────────────────────────
  937 |  // BAS-042/043: Duplicate section via rename → NO VALIDATION on live app (v1 spec not implemented)
  938 |  // BAS-046: Section delete → NO DELETE UI exists
  939 |  // BAS-052: Room delete → NO DELETE UI exists
  940 |  // BAS-057/058/059/060: Cross-validation (Set/Delivery, Return/Strike/Pickup) → NOT IMPLEMENTED on live app (/6)
  941 |  // Only NM-1264 (Delivery >= Prep)
  942 |  // is wired in the Angular implementation. Paths 3/5/6/7/8 from the plan are INVALIDATED (not "deferred").
  943 | 
  944 | });
  945 | 
```