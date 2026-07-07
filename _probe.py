from PIL import Image
im=Image.open(r"c:\projects\HOMELAB_MINI_AWS_CONSOLE\homecloud-docs\_after.png")
crop=im.crop((60,80,320,200)).resize((260*3,120*3))
crop.save(r"c:\projects\HOMELAB_MINI_AWS_CONSOLE\homecloud-docs\_crop.png")
print("ok", im.size)
