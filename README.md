node-linux-mountutils
=====================

Node.js wrapper for Linux mount/umount.

Usage
=====

    var mountutil = require('linux-mountutils');

ret = isMounted(path, isDevice)
-------------------------------

isMounted checks to see if a specific mount exists, either by mountpoint
or device.  It takes 2 arguments:

  * path - the mountpoint or device
  * isDevice - true means to look for a device, else a mountpoint

The function returns an object with details of the mount if it exists.
ret.mounted is always a boolean that indicates whether a mount exists.  If
there was an error, ret.error will contain a description.  If the mount
is there, there will be additional fields (see below).

Example:

    // See if device /dev/sda1 is mounted
    var ret = mountutil.isMounted("/dev/sda1",true);
    console.log(JSON.stringify(ret));
    // Returns: 
    //   {"mounted":true,"device":"/dev/sda1","mountpoint":"/boot","fstype":"ext2","fsopts":"rw,relatime,errors=continue"}

    // See if device /dev/notarealdevice is mounted
    ret = mountutil.isMounted("/dev/notarealdevice",true);
    // Returns: 
    //   {"mounted":false}

    // See if a device is mounted at /boot
    ret = mountutil.isMounted("/boot",false);
    // Returns:
    //    {"mounted":true,"device":"/dev/sda1","mountpoint":"/boot","fstype":"ext2","fsopts":"rw,relatime,errors=continue"}

mount(dev, path, options, callback)
-----------------------------------

mount is an asynchronous wrapper around the system mount binary.  It 
will mount (or try to mount) a device (or network filesystem) 'dev' at
the mountpoint 'path'.  When it finishes, it calls the callback function
with a single JSON object with result details.

Valid options:

  * fstype - filesystem type (ie. nfs, ext4, etc).  Default autodetected
  * readonly - mount device read only
  * fsopts - mount options for filesystem (ie. acl,quota)
  * mountPath - path to mount binary (defaults to /bin/mount)
  * sudoPath - path to sudo binary (defaults to /usr/bin/sudo)
  * noSudo - don't use sudo when calling binaries (default: use sudo)
  * createDir - create the mountpoint 'path' if it doesn't exist (default: no)
  * dirMode - mode to use for mountpoint if createDir is true

Example:

    // Mount /dev/sdc1 to /tmp/testmount
    mountutil.mount("/dev/sdc1","/tmp/testmount", { "createDir": true }, function(result) {
      if (result.error) {
        // Something went wrong!
        console.log(result.error);
      } else {
        // mount succeeded - do stuff here
      }
    });

umount(path, isDevice, options, callback)
-----------------------------------

umount is an asynchronous wrapper around the system umount binary.  It 
will umount a device or mountpoint.

Arguments:

  * path - the mountpoint or device
  * isDevice - true means to look for a device, else a mountpoint
  * options - object, see below
  * callback - function, will be called with success or fail

Valid options:

  * umountPath - path to mount binary (defaults to /bin/mount)
  * sudoPath - path to sudo binary (defaults to /usr/bin/sudo)
  * noSudo - don't use sudo when calling binaries (default: use sudo)
  * removeDir - remove mountpoint after umount (default no)

Example:

    // Unmount device mounted at /tmp/testmount and delete mountpoint
    mountutil.umount("/tmp/testmount", false, { "removeDir": true }, function(result) {
      if (result.error) {
        // Something went wrong!
        console.log(result.error);
      } else {
        // umount succeeded - do stuff here
      }
    });

