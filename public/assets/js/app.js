$(function () {
    const selectedUserIds = new Set();
    const $tableBody = $('#users-table-body');
    const $selectAll = $('#select-all-users');
    const $userForm = $('#user-form');
    const $userModal = new bootstrap.Modal('#user-form-modal');
    const $confirmModal = new bootstrap.Modal('#confirm-modal');
    const $warningModal = new bootstrap.Modal('#warning-modal');
    let confirmationCallback = null;

    function bulkActionsTemplate(position) {
        return `
            <div class="bulk-actions bulk-actions-${position}">
                <button type="button" class="btn btn-primary js-add-user">
                    <i class="bi bi-person-plus me-1" aria-hidden="true"></i>Add
                </button>
                <label class="visually-hidden" for="bulk-action-${position}">Bulk action</label>
                <select id="bulk-action-${position}" class="form-select js-bulk-action">
                    <option value="">Please Select</option>
                    <option value="set_active">Set active</option>
                    <option value="set_not_active">Set not active</option>
                    <option value="delete">Delete</option>
                </select>
                <button type="button" class="btn btn-outline-primary js-run-bulk-action">OK</button>
            </div>`;
    }

    function showMessage(type, message) {
        $('#app-message').html(`
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${escapeHtml(message)}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>`);
    }

    function showWarning(title, message) {
        $('#warning-modal-title').text(title);
        $('#warning-modal-message').text(message);
        $warningModal.show();
    }

    function askForConfirmation(title, message, callback) {
        confirmationCallback = callback;
        $('#confirm-modal-title').text(title);
        $('#confirm-modal-message').text(message);
        $confirmModal.show();
    }

    function escapeHtml(value) {
        return $('<div>').text(value).html();
    }

    function buildUserRow(user, checked = false) {
        const statusClass = user.status ? 'is-active' : 'is-inactive';
        const statusLabel = user.status ? 'Active' : 'Not active';

        return `
            <tr data-user-id="${user.id}">
                <td>
                    <input class="form-check-input js-user-checkbox" type="checkbox" value="${user.id}" aria-label="Select ${escapeHtml(user.name_first)} ${escapeHtml(user.name_last)}" ${checked ? 'checked' : ''}>
                </td>
                <td>${escapeHtml(user.name_first)} ${escapeHtml(user.name_last)}</td>
                <td class="text-center"><span class="status-indicator ${statusClass}" aria-label="${statusLabel}" title="${statusLabel}"></span></td>
                <td><span class="badge text-bg-light border">${escapeHtml(user.role)}</span></td>
                <td class="text-end">
                    <button type="button" class="btn my-2 my-md-0 btn-sm btn-outline-primary js-edit-user" data-user-id="${user.id}" aria-label="Edit user">
                        <i class="bi bi-pencil-square" aria-hidden="true"></i>
                    </button>
                    <button type="button" class="btn my-2 my-md-0 btn-sm btn-outline-danger js-delete-user" data-user-id="${user.id}" aria-label="Delete user">
                        <i class="bi bi-trash" aria-hidden="true"></i>
                    </button>
                </td>
            </tr>`;
    }

    function updateUserCount() {
        const count = $('.js-user-checkbox').length;
        $('#user-count').text(`${count} ${count === 1 ? 'user' : 'users'}`);
    }

    function showNoUsersRow() {
        $tableBody.html('<tr><td colspan="5" class="py-5 text-center text-body-secondary">No users found.</td></tr>');
        updateUserCount();
    }

    function getUserRow(id) {
        return $tableBody.find(`tr[data-user-id="${id}"]`);
    }

    function removeUserRow(id) {
        const row = getUserRow(id);
        if (row.length) {
            row.remove();
            selectedUserIds.delete(Number(id));
        }
        if ($('.js-user-checkbox').length === 0) {
            showNoUsersRow();
            $selectAll.prop({ checked: false, indeterminate: false });
        }
        updateUserCount();
        updateSelectAllState();
    }

    function replaceUserRow(user) {
        const row = getUserRow(user.id);
        const checked = row.find('.js-user-checkbox').prop('checked');
        if (row.length) {
            row.replaceWith(buildUserRow(user, checked));
        } else {
            $tableBody.append(buildUserRow(user));
        }
        updateUserCount();
        updateSelectAllState();
    }

    function addUserRow(user) {
        const noUsersRow = $tableBody.find('td[colspan="5"]');
        if (noUsersRow.length) {
            $tableBody.html(buildUserRow(user));
        } else {
            $tableBody.append(buildUserRow(user));
        }
        updateUserCount();
        updateSelectAllState();
    }

    function clearFormErrors() {
        $userForm.removeClass('was-validated');
        $userForm.find('.is-invalid').removeClass('is-invalid');
        $userForm.find('.invalid-feedback').text('');
    }

    function showFormErrors(fields) {
        Object.entries(fields || {}).forEach(([field, message]) => {
            const $input = $userForm.find(`[name="${field}"]`);
            $input.addClass('is-invalid');
            $input.siblings('.invalid-feedback').text(message);
        });
    }

    function openCreateModal() {
        clearFormErrors();
        $userForm[0].reset();
        $('#user-id').val('');
        $('#user-status').prop('checked', true);
        $('#user-role').val('user');
        $('#user-form-modal-title').text('Add user');
        $('#save-user').text('Add user');
        $userModal.show();
    }

    function openEditModal(id) {
        clearFormErrors();
        $('#user-form-modal-title').text('Edit user');
        $('#save-user').text('Save changes');

        $.getJSON(`/api/users/${id}`)
            .done((response) => {
                if (!response.status) {
                    showMessage('danger', response.error.message);
                    return;
                }

                const user = response.user;
                $('#user-id').val(user.id);
                $('#name-first').val(user.name_first);
                $('#name-last').val(user.name_last);
                $('#user-status').prop('checked', user.status);
                $('#user-role').val(user.role);
                $userModal.show();
            })
            .fail((xhr) => {
                const response = xhr.responseJSON;
                showMessage('danger', response?.error?.message || 'Unable to load the user.');
            });
    }

    function updateSelectAllState() {
        const total = $('.js-user-checkbox').length;
        const selected = selectedUserIds.size;
        $selectAll.prop({
            checked: total > 0 && selected === total,
            indeterminate: selected > 0 && selected < total,
        });
    }


    function executeBulkAction($button, action, ids) {
        $button.prop('disabled', true);
        $.ajax({
            url: '/api/users/bulk-action',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ action, ids }),
        }).done((response) => {
            if (!response.status) {
                showMessage('danger', response.error.message);
                return;
            }

            showMessage('success', `Updated ${response.affected} user(s).`);
            if (action === 'delete') {
                ids.forEach((id) => removeUserRow(id));
                $selectAll.prop({ checked: false, indeterminate: false });
            } else {
                const isActive = action === 'set_active';
                ids.forEach((id) => {
                    const row = getUserRow(id);
                    if (!row.length) {
                        return;
                    }
                    const statusIndicator = row.find('.status-indicator');
                    const statusLabel = isActive ? 'Active' : 'Not active';
                    statusIndicator.toggleClass('is-active', isActive);
                    statusIndicator.toggleClass('is-inactive', !isActive);
                    statusIndicator.attr('aria-label', statusLabel).attr('title', statusLabel);
                });
            }
        }).fail((xhr) => {
            const response = xhr.responseJSON;
            showMessage('danger', response?.error?.message || 'Unable to apply the bulk action.');
        }).always(() => {
            $button.prop('disabled', false);
        });
    }

    function runBulkAction($button) {
        const action = $button.siblings('.js-bulk-action').val();
        const ids = Array.from(selectedUserIds);

        if (ids.length === 0 && action) {
            showWarning('No users selected', 'Select at least one user before applying an action.');
            return;
        }
        if (ids.length > 0 && !action) {
            showWarning('No action selected', 'Select an action before pressing OK.');
            return;
        }
        if (ids.length === 0 && !action) {
            showWarning('Select users and an action', 'Select at least one user and an action before pressing OK.');
            return;
        }

        if (action === 'delete') {
            askForConfirmation('Delete users', `Delete ${ids.length} selected user(s)? This action cannot be undone.`, () => {
                executeBulkAction($button, action, ids);
            });
            return;
        }

        executeBulkAction($button, action, ids);
    }

    function deleteUser(id) {
        askForConfirmation('Delete user', 'Delete this user? This action cannot be undone.', () => {
            $.ajax({
                url: `/api/users/${id}`,
                method: 'DELETE',
            }).done((response) => {
                if (!response.status) {
                    showMessage('danger', response.error.message);
                    return;
                }

                showMessage('success', 'User deleted.');
                removeUserRow(id);
                $selectAll.prop({ checked: false, indeterminate: false });
            }).fail((xhr) => {
                const response = xhr.responseJSON;
                showMessage('danger', response?.error?.message || 'Unable to delete the user.');
            });
        });
    }

    $('#bulk-actions-top').html(bulkActionsTemplate('top'));
    $('#bulk-actions-bottom').html(bulkActionsTemplate('bottom'));

    $(document).on('change', '.js-user-checkbox', function () {
        const id = Number(this.value);
        if (this.checked) {
            selectedUserIds.add(id);
        } else {
            selectedUserIds.delete(id);
        }
        updateSelectAllState();
    });

    $selectAll.on('change', function () {
        $('.js-user-checkbox').each(function () {
            this.checked = $selectAll.prop('checked');
            const id = Number(this.value);
            if (this.checked) {
                selectedUserIds.add(id);
            } else {
                selectedUserIds.delete(id);
            }
        });
        updateSelectAllState();
    });

    $(document).on('click', '.js-run-bulk-action', function () {
        runBulkAction($(this));
    });

    $(document).on('click', '.js-add-user', openCreateModal);

    $(document).on('click', '.js-edit-user', function () {
        openEditModal($(this).data('user-id'));
    });

    $(document).on('click', '.js-delete-user', function () {
        deleteUser($(this).data('user-id'));
    });

    $('#confirm-modal-submit').on('click', function () {
        const callback = confirmationCallback;
        confirmationCallback = null;
        $confirmModal.hide();
        if (callback) {
            callback();
        }
    });

    $('#confirm-modal').on('hidden.bs.modal', function () {
        confirmationCallback = null;
    });

    $userForm.on('submit', function (event) {
        event.preventDefault();
        clearFormErrors();

        const form = this;
        if (!form.checkValidity()) {
            $(form).addClass('was-validated');
            return;
        }

        const id = $('#user-id').val();
        const isEditing = id !== '';
        const $saveButton = $('#save-user');
        const payload = {
            name_first: $('#name-first').val().trim(),
            name_last: $('#name-last').val().trim(),
            status: $('#user-status').prop('checked'),
            role: $('#user-role').val(),
        };

        $saveButton.prop('disabled', true);
        $.ajax({
            url: isEditing ? `/api/users/${id}` : '/api/users',
            method: isEditing ? 'PUT' : 'POST',
            contentType: 'application/json',
            data: JSON.stringify(payload),
        }).done((response) => {
            if (!response.status) {
                showFormErrors(response.error.fields);
                return;
            }

            const savedUser = {
                id: isEditing ? Number(id) : response.id,
                name_first: payload.name_first,
                name_last: payload.name_last,
                status: payload.status,
                role: payload.role,
            };

            if (isEditing) {
                replaceUserRow(savedUser);
                showMessage('success', 'User updated.');
            } else {
                addUserRow(savedUser);
                showMessage('success', 'User added.');
            }

            $userModal.hide();
        }).fail((xhr) => {
            const response = xhr.responseJSON;
            if (response?.error?.fields) {
                showFormErrors(response.error.fields);
                return;
            }
            showMessage('danger', response?.error?.message || 'Unable to save the user.');
        }).always(() => {
            $saveButton.prop('disabled', false);
        });
    });
});
